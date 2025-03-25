import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Product } from "../../models/product";
import { ProductService } from "../../services/product/product.service";
import { CartService } from "../../services/cart/cart.service";
import { SuccessModalComponent } from "../success-modal/success-modal.component";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, SuccessModalComponent],
  templateUrl: "./product-list.component.html",
})
export class ProductListComponent implements OnInit {
  modalMessage: string = "";
  showModal = false;

  constructor(public productService: ProductService, public  cartService: CartService) {}

  ngOnInit() {
    this.productService.fetchProducts()
  }

  addToCart(product: Product) {
    try {
    this.cartService.addToCart(product)
  } catch (err: any) {
    this.modalMessage = err.message;
    this.showModal = true;
  }
  this.showModal = true;
  this.modalMessage = "Producto agregado al carrito";
}
}