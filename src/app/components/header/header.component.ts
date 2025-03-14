import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent{
  filteredProducts: Product[] = []; 
  username: string = ''; 

  constructor(private productService: ProductService, private authService: AuthService) {}

  ngOnInit(): void {
    // Imprime el username cuando el componente se inicializa
    const username = this.authService.getUsername();
    console.log('Username en ngOnInit:', username); // Depuración
    this.username = username || '';  // Si no hay usuario, el username será ''
  }

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
