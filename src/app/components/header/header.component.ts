import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent{
  filteredProducts: Product[] = []; 

  constructor(private productService: ProductService) {}

 

  // Este método se ejecuta cuando el usuario escribe en el input
  inputSearch(event: any): void {
    const searchTerm = event.target.value;
    this.productService.setSearchTerm(searchTerm); 
    this.updateFilteredProducts(); 
  }


  updateFilteredProducts(): void {
    this.filteredProducts = this.productService.getFilteredProducts()();
  }
}
