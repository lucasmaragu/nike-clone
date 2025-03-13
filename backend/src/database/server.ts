import express, { Request, Response } from 'express';
import db from './index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import cors from 'cors';

const app = express();
app.use(cors());
const port = 3000;
const JWT_SECRET = 'secret';

// Middleware para permitir peticiones JSON
app.use(express.json());

app.post('/api/register', [
  body('username').isString().notEmpty(),
  body('password').isString().isLength({ min: 6 }),
], async (req: Request, res: Response): Promise<void> => {  // Agregamos Promise<void> como tipo de retorno
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;  // Detener la ejecución después de enviar la respuesta
  }

  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db
      .insertInto('users')
      .values({ username, password: hashedPassword })
      .returning(['id', 'username'])
      .executeTakeFirst();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

app.post('/api/login', [body('username').isString().notEmpty(), body('password').isString().notEmpty()], async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const user = await db
    .selectFrom('users')
    .select(['id', 'username', 'password'])
    .where('username', '=', username)
    .executeTakeFirst();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    return;  // Detener la ejecución después de enviar la respuesta
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token }); // Enviar la respuesta aquí, no retornar res
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
