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


app.post('/api/products', [
  body('reference_number').isNumeric(),
  body('name').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('type').isString().notEmpty(), // Validar que el tipo sea un string y no esté vacío
  body('stock').isNumeric(),
  body('price').isFloat({ gt: 0 }), // Validar que el precio sea mayor a 0
  body('on_sale').isBoolean(), // Validar que on_sale sea un booleano
  body('image_url').isString().notEmpty(), // Validar que la URL de la imagen sea un string y no esté vacía
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { reference_number, name, description, price, type, stock, image_url, on_sale } = req.body; // Incluir tipo en la solicitud

  try {
    const newProduct = await db
      .insertInto('products')
      .values({
        reference_number,
        name,
        description,
        price,
        type,
        stock,
        image_url,
        on_sale
      })
      .returningAll()
      .executeTakeFirst();

    res.status(201).json({ message: 'Producto creado exitosamente', product: newProduct });
  } catch (error) {
    console.error('Error al insertar producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});
app.get('/api/products', async (req: Request, res: Response): Promise<void> => {
  try {
    // Recupera todos los productos de la base de datos
    const products = await db
    .selectFrom('products')
    .selectAll()
    .execute(); // Suponiendo que 'products' es el nombre de tu tabla

    // Responde con el estado 200 y los productos
    res.status(200).json({ products });
  } catch (error) {
    // Si hay un error en la base de datos, responde con el estado 500
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

app.delete('/api/products/:referenceNumber', async (req: Request, res: Response): Promise<void> => {
  const referenceNumber = Number(req.params.referenceNumber); // Convertir a número

  if (isNaN(referenceNumber)) {
    res.status(400).json({ error: 'El número de referencia debe ser un número válido' });
    return;
  }

  try {
    const deletedProduct = await db
      .deleteFrom('products')
      .where('reference_number', '=', referenceNumber) // Ahora es un número
      .executeTakeFirst();

    if (!deletedProduct) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

app.get('/api/products/:referenceNumber', async (req: Request, res: Response): Promise<void> => {
  const referenceNumber = Number(req.params.referenceNumber); // Convertir a número
  try {
    const product = await db
      .selectFrom('products')
      .selectAll()
      .where('reference_number', '=', referenceNumber) // Ahora es un número
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({ product });
  }
  catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});


app.get('/api/carrito', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Obteniendo carrito');
    const cart = await db
      .selectFrom('shopping_cart')
      .selectAll()
      .execute();
    console.log(cart);
    res.status(200).json({ cart });
  }
  catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

app.post('/api/carrito/:referenceNumber', [
  body('quantity').isNumeric(),
  body('user_id').isNumeric(),
 ], async (req: Request, res: Response): Promise<void> => {
  
  const { quantity, user_id } = req.body;
  const referenceNumber = Number(req.params.referenceNumber); 
  
  try {
    const productCart = await db
      .insertInto('shopping_cart')
      .values({ product_id: referenceNumber, quantity: quantity, user_id: user_id })
      .returningAll()
      .executeTakeFirst();
    res.status(201).json({ message: 'Producto agregado al carrito', productCart });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }

});

app.delete('/api/carrito/:referenceNumber', async (req: Request, res: Response): Promise<void> => {
  const referenceNumber = Number(req.params.referenceNumber); 
  try {
    const deletedProduct = await db
      .deleteFrom('shopping_cart')
      .where('product_id', '=', referenceNumber)
      .executeTakeFirst();
    if (!deletedProduct) {
      res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      return;
    }
    res.status(200).json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
} );


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
