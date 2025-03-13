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
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./index"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const port = 3000;
const JWT_SECRET = 'secret';
// Middleware para permitir peticiones JSON
app.use(express_1.default.json());
app.post('/api/register', [
    (0, express_validator_1.body)('username').isString().notEmpty(),
    (0, express_validator_1.body)('password').isString().isLength({ min: 6 }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return; // Detener la ejecución después de enviar la respuesta
    }
    const { username, password } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const user = yield index_1.default
            .insertInto('users')
            .values({ username, password: hashedPassword })
            .returning(['id', 'username'])
            .executeTakeFirst();
        res.status(201).json(user); // Enviar la respuesta aquí, no retornar res
    }
    catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
}));
app.post('/api/login', [(0, express_validator_1.body)('username').isString().notEmpty(), (0, express_validator_1.body)('password').isString().notEmpty()], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield index_1.default
        .selectFrom('users')
        .select(['id', 'username', 'password'])
        .where('username', '=', username)
        .executeTakeFirst();
    if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
        res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        return; // Detener la ejecución después de enviar la respuesta
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '1h',
    });
    res.json({ token }); // Enviar la respuesta aquí, no retornar res
}));
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
