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
  body('email').isString().notEmpty(),
  body('password').isString().isLength({ min: 6 }),
  body('role').isString().notEmpty(), // Validar que rol sea un string y no esté vacío
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password, role } = req.body; // Asegurarse de recibir rol
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db
      .insertInto('users')
      .values({ email, password: hashedPassword, role }) // Incluir rol en la inserción
      .returning(['id', 'email', 'role']) // Devolver el rol en la respuesta
      .executeTakeFirst();

    res.status(201).json(user);
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});


app.post('/api/login', [body('email').isString().notEmpty(), body('password').isString().notEmpty()], async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await db
    .selectFrom('users')
    .select(['id', 'email', 'password', 'role'])
    .where('email', '=', email)
    .executeTakeFirst();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    return;  // Detener la ejecución después de enviar la respuesta
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token, role: user.role }); // Enviar la respuesta aquí, no retornar res
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
