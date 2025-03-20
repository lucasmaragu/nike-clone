import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Product } from "../../models/product";
import { ProductService } from "../../services/product/product.service";
import { CartService } from "../../services/cart/cart.service";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-list.component.html",
})
export class ProductListComponent implements OnInit {
  constructor(public productService: ProductService, public  cartService: CartService) {}

  ngOnInit() {
    // Asegurarnos de que se cargan los productos
    this.productService.fetchProducts()
    console.log("🔄 Solicitando productos desde el componente")
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product)
  }
}