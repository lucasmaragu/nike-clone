import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../models/product';

const MOCK_PRODUCTS: Product[] = [
  {
    reference_number: "0001",
    name: "Nike Air Max Dn8",
    price: 189.99,
    type: "Footwear",
    description: "Las nuevas Nike Air Max Dn8 con tecnología de amortiguación avanzada.",
    image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/59ff827c-5672-4657-9eca-0179dfe206c3/AIR+MAX+DN8.png",
    on_sale: true,
  },
  {
    reference_number: "0002",
    name: "Nike Air Max Plus",
    price: 189.99,
    type: "Footwear",
    description: "Zapatillas Nike Air Max Plus con diseño clásico y comodidad superior.",
    image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/b16396a9-b08a-499b-b86f-0aad51447b98/NIKE+AIR+MAX+PLUS.png",
    on_sale: false,
  },
  {
    reference_number: "AM-PLUS-OG-001",
    name: "Nike Air Max Plus OG",
    price: 189.99,
    type: "Footwear",
    description: "La versión original de las icónicas Nike Air Max Plus.",
    image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc77b0c-11b8-4156-be41-c9fd8e9553cb/NIKE+AIR+MAX+PLUS.png",
    on_sale: true,
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsSignal = signal(MOCK_PRODUCTS);
  private searchTermSignal = signal<string>('');
  
  filteredProductsSignal = signal<Product[]>(MOCK_PRODUCTS); 


  getProducts(): Product[] {
    return this.productsSignal(); // Llamamos a la Signal para obtener los productos
  }

 

  addProduct(product: Product) {
    // Utilizamos update() para agregar un nuevo producto a la Signal
    this.productsSignal.update((products) => [...products, product]);
  }

  async updateProduct(productId: string, updatedData: any): Promise<void> {
    // Actualizamos los productos con la lógica de map() y luego actualizamos la Signal
    this.productsSignal.update((currentProducts) =>
      currentProducts.map((p) =>
        p.reference_number === productId ? { ...p, ...updatedData } : p
      )
    );
  
  }

  async getProductByReferenceNumber(referenceNumber: string): Promise<Product | null> {
    // Utilizamos getProducts() para obtener los productos y buscar por reference_number
    const products = this.getProducts();
    return products.find((p) => p.reference_number === referenceNumber) || null;
  }


  getFilteredProducts() {
    return computed(() => {
      const searchTerm = this.searchTermSignal();
      if (searchTerm === '') return []; // Si el searchTerm es vacío, devuelve un arreglo vacío
      return this.productsSignal().filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }
  

  setSearchTerm(searchTerm: string): void {
    this.searchTermSignal.update(() => searchTerm);  // Usamos update() para cambiar el valor de la Signal
  }
}
