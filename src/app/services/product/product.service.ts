import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../models/product';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const MOCK_PRODUCTS: Product[] = [
  {
    reference_number: "AM-DN8-001",
    name: "Nike Air Max Dn8",
    price: 189.99,
    type: "Zapatillas - Hombre",
    description: "Las nuevas Nike Air Max Dn8 con tecnología de amortiguación avanzada.",
    image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/59ff827c-5672-4657-9eca-0179dfe206c3/AIR+MAX+DN8.png",
    on_sale: true,
  },
  {
    reference_number: "AM-PLUS-001",
    name: "Nike Air Max Plus",
    price: 189.99,
    type: "Zapatillas - Hombre",
    description: "Zapatillas Nike Air Max Plus con diseño clásico y comodidad superior.",
    image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/b16396a9-b08a-499b-b86f-0aad51447b98/NIKE+AIR+MAX+PLUS.png",
    on_sale: false,
  },
  {
    reference_number: "AM-PLUS-OG-001",
    name: "Nike Air Max Plus OG",
    price: 189.99,
    type: "Zapatillas - Hombre",
    description: "La versión original de las icónicas Nike Air Max Plus.",
    image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc77b0c-11b8-4156-be41-c9fd8e9553cb/NIKE+AIR+MAX+PLUS.png",
    on_sale: true,
  },];

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productsSubject = new BehaviorSubject<Product[]>(MOCK_PRODUCTS);

  products$ = this.productsSubject.asObservable(); 

  getProducts(): Product[] {
    return this.productsSubject.value;
  }
 
  addProduct(newProduct: Product) {
    const currentProducts = this.productsSubject.value;
    const updatedProducts = [...currentProducts, newProduct];
  
    this.productsSubject.next(updatedProducts);
  }
  
}
