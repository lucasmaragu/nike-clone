import db from './index';
import { sql } from 'kysely'; // Asegúrate de importar `sql`

async function createTables() {
  // Crear tabla de productos
  await db.schema.createTable('products')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar')
    .addColumn('price', 'numeric')
    .addColumn('description', 'varchar')
    .execute();

  // Crear tabla de usuarios
  await db.schema.createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar')
    .addColumn('password', 'varchar')
    .addColumn('role', 'varchar')
    .execute();

  // Crear tabla de carrito de compras
  await db.schema.createTable('shopping_cart')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer')
    .addColumn('product_id', 'integer')
    .addColumn('quantity', 'integer')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))  // Usamos sql`NOW()`
    .addForeignKeyConstraint('shopping_cart_user_fk', ['user_id'], 'users', ['id'])
    .addForeignKeyConstraint('shopping_cart_product_fk', ['product_id'], 'products', ['id'])
    .execute();

  // Crear tabla de compras
  await db.schema.createTable('shopping')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer')
    .addColumn('total_price', 'numeric')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))  // También para la tabla `shopping`
    .addForeignKeyConstraint('shopping_user_fk', ['user_id'], 'users', ['id'])
    .execute();
}

createTables()
  .then(() => console.log('Tablas creadas exitosamente'))
  .catch((err) => console.error('Error al crear tablas', err))
  .finally(() => process.exit());
