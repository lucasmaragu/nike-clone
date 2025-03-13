import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Product } from "../../models/product";
import { ProductService } from "../../services/product/product.service";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-list.component.html",
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  

  constructor(private productService: ProductService) {}

  ngOnInit() {
 
    this.loading = true;
    try {
      this.products = this.productService.getProducts();
      console.log("📦 Productos cargados en ProductList:", this.products);
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
      this.error = "Error al cargar productos";
    } finally {
      this.loading = false;
    }
  }
}