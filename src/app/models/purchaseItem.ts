import { Product } from './product';
export interface PurchaseItem {
    id: number;
    shopping_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product?: Product; // Aquí la propiedad 'product' es opcional y puede ser un objeto con detalles del producto.
  }
  