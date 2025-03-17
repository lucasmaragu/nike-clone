import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../models/product';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';



interface ProductsResponse {
  products: Product[]
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Signals para el estado
   productsSignal = signal<Product[]>([])
   searchTermSignal = signal<string>("")
  loading = signal<boolean>(false)
  error = signal<string | null>(null)
  currentProduct = signal<Product | null>(null)

  // API URL
  private apiUrl = "http://localhost:3000/api"

  constructor(private http: HttpClient) {
    // Cargar productos al inicializar el servicio
    this.fetchProducts()
  }

  // Obtener todos los productos desde la API
  fetchProducts(): void {
    this.loading.set(true)
    this.error.set(null)

    this.http.get<ProductsResponse>(`${this.apiUrl}/products`).subscribe({
      next: (response) => {
        console.log("📦 Respuesta de la API:", response)
        // La API devuelve { products: [...] }, así que accedemos a products
        this.productsSignal.set(response.products)
        this.loading.set(false)
      },
      error: (err) => {
        console.error("❌ Error al obtener productos:", err)
        this.error.set("Error al cargar los productos")
        this.loading.set(false)

        // Si hay un error, cargamos los productos de prueba
      
      },
    })
  }


  

  // Obtener productos (devuelve el valor actual del signal)
  getProducts(): Product[] {
    return this.productsSignal()
  }

  // Crear un nuevo producto
  createProduct(product: Product): void {
    console.log("Creando producto:", product)
    this.loading.set(true)
    this.error.set(null)

    this.http.post<{ message: string; product: Product }>(`${this.apiUrl}/products`, product).subscribe({
      next: (response) => {
        // Actualizar la lista de productos añadiendo el nuevo
        this.productsSignal.update((products) => [...products, response.product])
        this.currentProduct.set(response.product)
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set("Error al crear el producto")
        this.loading.set(false)
        console.error("Error al crear el producto:", err)
      },
    })
  }

  // Añadir producto (versión local sin API)
  addProduct(product: Product): void {
    // Primero intentamos crear en la API
    this.loading.set(true)
    this.error.set(null)

    this.http.post<{ message: string; product: Product }>(`${this.apiUrl}/products`, product).subscribe({
      next: (response) => {
        // Actualizar la lista de productos añadiendo el nuevo
        this.productsSignal.update((products) => [...products, response.product])
        this.loading.set(false)
      },
      error: (err) => {
        // Si falla la API, actualizamos localmente
        console.error("Error al crear el producto en API:", err)
        this.productsSignal.update((products) => [...products, product])
        this.loading.set(false)
      },
    })
  }

  // Actualizar un producto existente
  updateProduct(referenceNumber: number, updatedData: Partial<Product>): Promise<void> {
    this.loading.set(true)
    this.error.set(null)

    return new Promise((resolve, reject) => {
      this.http
        .put<{ message: string; product: Product }>(`${this.apiUrl}/products/${referenceNumber}`, updatedData)
        .subscribe({
          next: (response) => {
            // Actualizar la lista de productos con el producto actualizado
            this.productsSignal.update((products) =>
              products.map((p) => (p.reference_number === referenceNumber ? response.product : p)),
            )
            this.loading.set(false)
            resolve()
          },
          error: (err) => {
            console.error(`Error al actualizar producto con referencia ${referenceNumber}:`, err)

            // Si falla la API, actualizamos localmente
            this.productsSignal.update((products) =>
              products.map((p) => (p.reference_number === referenceNumber ? { ...p, ...updatedData } : p)),
            )

            this.error.set("Error al actualizar el producto")
            this.loading.set(false)
            resolve() // Resolvemos de todas formas para no bloquear la UI
          },
        })
    })
  }

  // Eliminar un producto
  deleteProduct(referenceNumber: number): void {
    this.loading.set(true)
    this.error.set(null)

    this.http.delete<{ message: string }>(`${this.apiUrl}/products/${referenceNumber}`).subscribe({
      next: () => {
        // Eliminar el producto de la lista
        this.productsSignal.update((products) => products.filter((p) => p.reference_number !== referenceNumber))
        this.loading.set(false)
      },
      error: (err) => {
        console.error(`Error al eliminar producto con referencia ${referenceNumber}:`, err)

        // Si falla la API, eliminamos localmente de todas formas
        this.productsSignal.update((products) => products.filter((p) => p.reference_number !== referenceNumber))

        this.error.set("Error al eliminar el producto")
        this.loading.set(false)
      },
    })
  }

  // Obtener un producto por número de referencia
  async getProductByReferenceNumber(referenceNumber: number): Promise<Product | null> {
    this.loading.set(true)
    this.error.set(null)

    try {
      // Primero intentamos obtener de la API
      const response = await this.http.get<Product>(`${this.apiUrl}/products/${referenceNumber}`).toPromise()
      this.loading.set(false)

      if (response) {
        this.currentProduct.set(response)
        return response
      }

      return null
    } catch (err) {
      console.error(`Error al obtener producto con referencia ${referenceNumber}:`, err)

      // Si falla la API, buscamos en la lista local
      const products = this.productsSignal()
      const product = products.find((p) => p.reference_number === referenceNumber) || null

      if (product) {
        this.currentProduct.set(product)
      }

      this.loading.set(false)
      return product
    }
  }

  // Filtrar productos por término de búsqueda
  getFilteredProducts() {
    return computed(() => {
      const searchTerm = this.searchTermSignal()
      if (!searchTerm) return this.productsSignal() // Si no hay término, devuelve todos los productos

      return this.productsSignal().filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    })
  }

  // Establecer término de búsqueda
  setSearchTerm(searchTerm: string): void {
    this.searchTermSignal.set(searchTerm)
  }

  // Obtener headers con autenticación
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("token")
    return new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    })
  }
}

