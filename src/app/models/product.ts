export interface Product {
  reference_number: number;
  name: string;
  description: string;
  price: number;
  type: string;
  image_url?: string;
  on_sale: boolean;
  stock: number;
}