import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Product } from "../models/product";
import { ProductService } from "../services/product/product.service";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-list.component.html",
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.products$.subscribe({
      next: (products) => {
        console.log("📦 Productos recibidos en ProductList:", products);
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error("❌ Error al cargar productos:", error);
        this.error = "Error al cargar productos";
        this.loading = false;
      },
      complete: () => {
        console.log("✅ Suscripción completada");
      }
    });
  }
  
  
}
