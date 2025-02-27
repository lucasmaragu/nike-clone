import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

import { RouterModule } from "@angular/router"

interface Product {
  id: string
  name: string
  price: number
  type: string
  description: string
  image_url: string
  reference_number: string
  colors_available: number
  coming_soon?: boolean
}

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./product-list.component.html",
})
export class ProductListComponent  {
  products: Product[] = []
  loading = true
  error: string | null = null

  

  constructor() {}

 

 


  getMockProducts(): Product[] {
    return [
      {
        id: "1",
        name: "Nike Air Max Dn8",
        price: 189.99,
        type: "Zapatillas - Hombre",
        description: "Las nuevas Nike Air Max Dn8 con tecnología de amortiguación avanzada.",
        image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/59ff827c-5672-4657-9eca-0179dfe206c3/AIR+MAX+DN8.png",
        reference_number: "AM-DN8-001",
        colors_available: 4,
        coming_soon: true,
      },
      {
        id: "2",
        name: "Nike Air Max Plus",
        price: 189.99,
        type: "Zapatillas - Hombre",
        description: "Zapatillas Nike Air Max Plus con diseño clásico y comodidad superior.",
        image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/b16396a9-b08a-499b-b86f-0aad51447b98/NIKE+AIR+MAX+PLUS.png",
        reference_number: "AM-PLUS-001",
        colors_available: 10,
      },
      {
        id: "3",
        name: "Nike Air Max Plus OG",
        price: 189.99,
        type: "Zapatillas - Hombre",
        description: "La versión original de las icónicas Nike Air Max Plus.",
        image_url: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc77b0c-11b8-4156-be41-c9fd8e9553cb/NIKE+AIR+MAX+PLUS.png",
        reference_number: "AM-PLUS-OG-001",
        colors_available: 4,
      },
    ]
  }
}

