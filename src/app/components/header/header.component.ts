import { Component, OnInit, signal, effect } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent{
  role = signal<string | null>(null); 
  filteredProducts: Product[] = []; 
  username: string = ''; 



  constructor(private productService: ProductService, private authService: AuthService, private router: Router) {
    effect(() => {
      this.role.set(this.authService.getRole()); 
    }
    );
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
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
