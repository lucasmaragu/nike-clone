import db from './index';
import { sql } from 'kysely';

async function createTables() {
  // Crear tabla de productos con los campos actualizados
  await db.schema.createTable('products')
    .addColumn('reference_number', 'serial', (col) => col.primaryKey()) // Cambia 'id' por 'reference_number'
    .addColumn('name', 'varchar')
    .addColumn('description', 'varchar')
    .addColumn('price', 'numeric')
    .addColumn('type', 'varchar') // Nuevo campo
    .addColumn('image_url', 'varchar') // Nuevo campo
    .addColumn('stock', 'integer') // Cambia 'quantity' por 'stock'
    .addColumn('on_sale', 'boolean', (col) => col.defaultTo(false)) // Nuevo campo con valor por defecto
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
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addForeignKeyConstraint('shopping_cart_user_fk', ['user_id'], 'users', ['id'])
    .addForeignKeyConstraint('shopping_cart_product_fk', ['product_id'], 'products', ['reference_number']) // Ajuste a la nueva clave primaria
    .execute();

  // Crear tabla de compras
  await db.schema.createTable('shopping')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer')
    .addColumn('total_price', 'numeric')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addForeignKeyConstraint('shopping_user_fk', ['user_id'], 'users', ['id'])
    .execute();

  await db.schema.createTable('shopping_item')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('shopping_id', 'integer')
    .addColumn('product_id', 'integer')
    .addColumn('quantity', 'integer')
    .addColumn('price', 'numeric')
    .addForeignKeyConstraint('shopping_item_shopping_fk', ['shopping_id'], 'shopping', ['id'])
    .addForeignKeyConstraint('shopping_item_product_fk', ['product_id'], 'products', ['reference_number']) // Ajuste a la nueva clave primaria
    .execute();
}

createTables()
  .then(() => console.log('Tablas creadas exitosamente'))
  .catch((err) => console.error('Error al crear tablas', err))
  .finally(() => process.exit());
