export interface Product {
  reference_number: string;
  name: string;
  description: string;
  price: number;
  type: string;
  image_url?: string;
  on_sale: boolean;
  stock: number;
}