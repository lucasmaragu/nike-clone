// purchase.service.ts

import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Purchase } from "../../models/purchase"; // Importa tu modelo de compra
import { forkJoin } from "rxjs";
import { AuthService } from "../auth/auth.service";

interface PurchaseResponse {
  purchases: Purchase[];
}

interface ItemResponse {
  items: any[]; // Aquí deberías definir un tipo para los ítems, si no lo tienes aún
}

@Injectable({
  providedIn: "root",
})
export class PurchaseService {
  purchasesSignal = signal<Purchase[]>([]);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);
  private apiUrl = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  // Método para obtener las compras
  fetchPurchases(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<PurchaseResponse>(`${this.apiUrl}/compras`).subscribe({
      next: (response) => {
        const purchases = response.purchases;

        if (purchases.length === 0) {
          this.purchasesSignal.set([]);
          this.loadingSignal.set(false);
          return;
        }

        // Obtener los ítems de cada compra
        const itemRequests = purchases.map((purchase) =>
          this.http.get<ItemResponse>(`${this.apiUrl}/compras/${purchase.id}/items`)
        );

        // Esperar que todas las solicitudes de ítems se completen
        forkJoin(itemRequests).subscribe({
          next: (itemsResponses) => {
            // Asignar los ítems a las compras
            const purchasesWithItems = purchases.map((purchase, index) => {
              const items = itemsResponses[index].items;
              return { ...purchase, items: items };
            });

            // Actualizar la señal de compras
            this.purchasesSignal.set(purchasesWithItems);
            this.loadingSignal.set(false);
          },
          error: (err) => {
            console.error("❌ Error al obtener los ítems:", err);
            this.errorSignal.set("Error al obtener los ítems");
            this.loadingSignal.set(false);
          },
        });
      },
      error: (err) => {
        console.error("❌ Error al obtener las compras:", err);
        this.errorSignal.set("Error al obtener las compras");
        this.loadingSignal.set(false);
      },
    });
  }
}
