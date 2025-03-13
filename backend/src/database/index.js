"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kysely_1 = require("kysely");
const pg_1 = require("pg");
const db = new kysely_1.Kysely({
    dialect: new kysely_1.PostgresDialect({
        pool: new pg_1.Pool({
            user: 'postgres', // Nombre del usuario
            host: 'localhost',
            database: 'Nike', // Nombre de tu base de datos
            password: 'password', // Contraseña del usuario
            port: 5432,
        }),
    }),
});
exports.default = db;
