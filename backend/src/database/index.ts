import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

interface Database {
  products: {
    reference_number: number;
    name: string;
    description: string;
    price: number;
    type: string;
    image_url: string;
    stock: number;
    on_sale: boolean;
  };
  shopping_cart: {
    user_id: number;
    product_id: number;
    quantity: number;
    created_at: Date;
  };
  users: {
    id?: number;
    email: string;
    password: string;
    role: string;
  };
  shopping: {
    id: number;
    user_id: number;
    total_price: number;
    created_at: string;
  };
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      user: 'postgres', // Nombre del usuario
      host: 'localhost',
      database: 'Nike', // Nombre de tu base de datos
      password: 'password', // Contraseña del usuario
      port: 5432,
    }),
  }),
});

export default db;
