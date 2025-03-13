"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const kysely_1 = require("kysely"); // Asegúrate de importar `sql`
function createTables() {
    return __awaiter(this, void 0, void 0, function* () {
        // Crear tabla de productos
        yield index_1.default.schema.createTable('products')
            .addColumn('id', 'serial', (col) => col.primaryKey())
            .addColumn('name', 'varchar')
            .addColumn('price', 'numeric')
            .addColumn('description', 'varchar')
            .execute();
        // Crear tabla de usuarios
        yield index_1.default.schema.createTable('users')
            .addColumn('id', 'serial', (col) => col.primaryKey())
            .addColumn('email', 'varchar')
            .addColumn('password', 'varchar')
            .execute();
        // Crear tabla de carrito de compras
        yield index_1.default.schema.createTable('shopping_cart')
            .addColumn('id', 'serial', (col) => col.primaryKey())
            .addColumn('user_id', 'integer')
            .addColumn('product_id', 'integer')
            .addColumn('quantity', 'integer')
            .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `NOW()`)) // Usamos sql`NOW()`
            .addForeignKeyConstraint('shopping_cart_user_fk', ['user_id'], 'users', ['id'])
            .addForeignKeyConstraint('shopping_cart_product_fk', ['product_id'], 'products', ['id'])
            .execute();
        // Crear tabla de compras
        yield index_1.default.schema.createTable('shopping')
            .addColumn('id', 'serial', (col) => col.primaryKey())
            .addColumn('user_id', 'integer')
            .addColumn('total_price', 'numeric')
            .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `NOW()`)) // También para la tabla `shopping`
            .addForeignKeyConstraint('shopping_user_fk', ['user_id'], 'users', ['id'])
            .execute();
    });
}
createTables()
    .then(() => console.log('Tablas creadas exitosamente'))
    .catch((err) => console.error('Error al crear tablas', err))
    .finally(() => process.exit());
