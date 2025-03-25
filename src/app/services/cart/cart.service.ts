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
    
    const userId = this.authService.getUserId();

    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Usamos el token si es necesario
      'userId': `${userId}` // Agregar el userId en los headers
    };
 
    this.http.get<CartResponse>(`${this.apiUrl}/carrito`, { headers }).subscribe({
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
  
  updateQuantity(item: CartItem, type: string): void {
    if (type === "increase" && Number(item.quantity) === 10) {
      console.warn("🛑 No se pueden añadir más de 10 productos en la cesta");
      return;
    }
    if (type === "decrease" && Number(item.quantity) === 1) {
      console.warn("🛑 No se pueden eliminar más de 1 producto en la cesta");
      return;
    }
  
    const newQuantity = type === "increase" ? Number(item.quantity) + 1 : Number(item.quantity) - 1;
  
    const userId = this.userId; // Obtener el userId del signal
  
    if (!userId) {
      console.error("❌ Error: No hay usuario logueado.");
      return;
    }
  
    // Actualizar en el backend
    this.http.patch(`${this.apiUrl}/carrito/${item.id}`, {
      userId,
      product_id: item.product_id,
      quantity: newQuantity,
    }).subscribe({
      next: () => {
        console.log(`✅ Cantidad actualizada en el servidor: ${newQuantity}`);
  
        // Actualizar el carrito localmente
        const updatedCart = this.cartSignal().map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
        );
  
        this.cartSignal.set(updatedCart);
      },
      error: (err) => {
        console.error("❌ Error al actualizar la cantidad:", err);
      }
    });
  }
  
  
  removeFromCart(item: CartItem): void {
      this.http.delete(`${this.apiUrl}/carrito/${item.id}`).subscribe({
      next: () => {
        console.log(`Producto ${item.product.name} eliminado del carrito`);
        this.fetchCart();
      }
    });
  }

  buyCart(totalAmount: Number): void {
    this.http.post(`${this.apiUrl}/carrito/comprar`, { user_id: this.userId, totalAmount: totalAmount }).subscribe({
      next: () => {
        this.fetchCart();
      },
      error: (err) => {
        console.error("❌ Error al comprar:", err);
      },
    });
  }
}
