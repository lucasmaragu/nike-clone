import { Injectable, signal, effect } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Cart } from "../../models/cart";
import { Product } from "../../models/product";
import { forkJoin } from "rxjs";
import { AuthService } from "../auth/auth.service";

interface CartResponse {
  cart: Cart[];
}

// Interfaz para manejar la respuesta anidada de la API
interface ProductResponse {
  product: Product;
}

export interface CartItem extends Cart {
  product: Product; 
}

@Injectable({
  providedIn: "root",
})
export class CartService {
  cartSignal = signal<CartItem[]>([]);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);

  userId: number | null = null;
  private apiUrl = "http://localhost:3000/api";

  constructor(private http: HttpClient, private authService: AuthService) {
    this.fetchCart();
    effect (() => {
      const userIdSignal = this.authService.getUserId();
      this.userId = userIdSignal;
    }
    );
  }

  fetchCart(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.http.get<CartResponse>(`${this.apiUrl}/carrito`).subscribe({
      next: (response) => {
        console.log("📦 Respuesta de la API:", response);
        const cartItems = response.cart;
        
        if (cartItems.length === 0) {
          this.cartSignal.set([]);
          this.loadingSignal.set(false);
          return;
        }

        // Obtener los detalles de los productos asociados al carrito
        const productRequests = cartItems.map((cartItem) =>
          this.http.get<ProductResponse>(`${this.apiUrl}/products/${cartItem.product_id}`)
        );

        // Usamos forkJoin para esperar que todas las solicitudes de productos se completen
        forkJoin(productRequests).subscribe({
          next: (productsResponse) => {
            console.log("Productos cargados:", productsResponse);
            
            // Extraer el objeto Product del nivel anidado
            const cartWithProducts = cartItems.map((cartItem, index) => {
              // Acceder al nivel correcto de anidamiento
              const productData = productsResponse[index].product;
              
              return {
                ...cartItem,
                product: productData // Asignar el objeto Product correcto
              };
            });

            console.log("Carrito con productos procesados:", cartWithProducts);
            this.cartSignal.set(cartWithProducts);
            this.loadingSignal.set(false);
          },
          error: (err) => {
            console.error("❌ Error al obtener productos:", err);
            this.errorSignal.set("Error al obtener productos");
            this.loadingSignal.set(false);
          },
        });
      },
      error: (err) => {
        console.error("❌ Error al obtener el carrito:", err);
        this.errorSignal.set("Error al obtener el carrito");
        this.loadingSignal.set(false);
      },
    });
  }

  addToCart(product: any) {
    console.log("user id al addtoCard" , this.userId)
    this.http.post(`${this.apiUrl}/carrito/${product.reference_number}`, { product_id: product.reference_number, user_id: this.userId }).subscribe({
      next: () => {
        this.fetchCart();
      }
    });
  }
  
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.product.stock) return;
    
    const updatedCart = this.cartSignal().map(cartItem => 
      cartItem.id === item.id 
        ? { ...cartItem, quantity: newQuantity as Number } 
        : cartItem
    );
    
    this.cartSignal.set(updatedCart);
  }
  
  removeFromCart(item: CartItem): void {
      this.http.delete(`${this.apiUrl}/carrito/${item.id}`).subscribe({
      next: () => {
        console.log(`Producto ${item.product.name} eliminado del carrito`);
        this.fetchCart();
      }
    });
  }

  buyCart(): void {
    this.http.post(`${this.apiUrl}/carrito/comprar`, { user_id: this.userId }).subscribe({
      next: () => {
        console.log("🛒 Compra realizada con éxito");
        this.fetchCart();
      },
      error: (err) => {
        console.error("❌ Error al comprar:", err);
      },
    });
  }
}
