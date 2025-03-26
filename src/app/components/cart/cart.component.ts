import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CartService, CartItem } from "../../services/cart/cart.service";
import { SuccessModalComponent } from "../success-modal/success-modal.component";

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"],
  standalone: true,
  imports: [CommonModule, SuccessModalComponent],
})
export class CartComponent implements OnInit {

  modalMessage: string = "";
  showModal: boolean = false;
  constructor(public cartService: CartService) {}



  ngOnInit(): void {
    this.cartService.fetchCart();
   
  }

  get cartItems(): CartItem[] {
    return this.cartService.cartSignal();
  }

  get subtotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.product.price * Number(item.quantity),
      0
    );
  }

  get shipping(): number {
    if (this.subtotal === 0) {
      return 0;
    }

    return this.subtotal > 100 ? 0 : 4.99;
  }

  get tax(): number {
    return this.subtotal * 0.21; // 21% IVA
  }

  get total(): number {
    return this.subtotal + this.shipping + this.tax;
  }

  // Métodos que ahora llaman a los del servicio
  updateQuantity(item: CartItem, type: string): void {
    this.cartService.updateQuantity(item, type);
  }

  removeItem(item: CartItem): void {

    this.cartService.removeFromCart(item);
  }

  

  comprarPedido(): void {
    try {
    this.cartService.buyCart(this.total);
  } catch (error) {
    this.modalMessage = "Error al comprar el pedido";
    this.showModal = true;
  }
    this.showModal = true;
    this.modalMessage = "Pedido realizado con éxito";
}
}
