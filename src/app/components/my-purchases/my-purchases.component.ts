// my-purchases.component.ts
import { Component, OnInit } from "@angular/core";
import { PurchaseService } from "../../services/purchase/purchase.service"; // Asegúrate de importar el servicio
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: "app-my-purchases",
  templateUrl: "./my-purchases.component.html",
  styleUrls: ["./my-purchases.component.css"],
  imports: [CommonModule]
})
export class MyPurchasesComponent implements OnInit {

  error: string | null = null;
  loading: boolean = false;

  constructor(private purchaseService: PurchaseService, authService: AuthService) {}

  ngOnInit(): void {
    // Llamar para cargar las compras y sus ítems
    this.purchaseService.fetchPurchases();
    console.log(this.purchases);
  }

  getTotalItems(purchase: any): number {
    return purchase.items.length;
  }

  get purchases() {
    console.log(this.purchaseService.purchasesSignal());
    return this.purchaseService.purchasesSignal();
  }
}
