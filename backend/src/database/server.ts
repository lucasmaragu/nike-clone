import express, { type Request, type Response } from "express"
import db from "./index"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import cors from "cors"

const app = express()
app.use(cors())
const port = 3000
const JWT_SECRET = "secret"

app.use(express.json())

app.post(
  "/api/register",
  [
    body("email").isString().notEmpty(),
    body("password").isString().isLength({ min: 6 }),
    body("role")
      .isString()
      .notEmpty(), // Validar que rol sea un string y no esté vacío
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { email, password, role } = req.body // Asegurarse de recibir rol
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const user = await db
        .insertInto("users")
        .values({ email, password: hashedPassword, role }) // Incluir rol en la inserción
        .returning(["id", "email", "role"]) // Devolver el rol en la respuesta
        .executeTakeFirst()

      res.status(201).json(user)
    } catch (error) {
      console.error("Error en el registro:", error)
      res.status(500).json({ error: "Error al registrar el usuario" })
    }
  },
)

app.post(
  "/api/login",
  [body("email").isString().notEmpty(), body("password").isString().notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    const user = await db
      .selectFrom("users")
      .select(["id", "email", "password", "role"])
      .where("email", "=", email)
      .executeTakeFirst()

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Usuario o contraseña incorrectos" })
      return // Detener la ejecución después de enviar la respuesta
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    })

    res.json({ token, role: user.role, id: user.id }) // Enviar la respuesta aquí, no retornar res
  },
)

app.post(
  "/api/products",
  [
    body("reference_number").isNumeric(),
    body("name").isString().notEmpty(),
    body("description").isString().notEmpty(),
    body("type")
      .isString()
      .notEmpty(), // Validar que el tipo sea un string y no esté vacío
    body("stock").isNumeric(),
    body("price").isFloat({ gt: 0 }), // Validar que el precio sea mayor a 0
    body("on_sale").isBoolean(), // Validar que on_sale sea un booleano
    body("image_url")
      .isString()
      .notEmpty(), // Validar que la URL de la imagen sea un string y no esté vacía
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { reference_number, name, description, price, type, stock, image_url, on_sale } = req.body // Incluir tipo en la solicitud

    try {
      const newProduct = await db
        .insertInto("products")
        .values({
          reference_number,
          name,
          description,
          price,
          type,
          stock,
          image_url,
          on_sale,
        })
        .returningAll()
        .executeTakeFirst()

      res.status(201).json({ message: "Producto creado exitosamente", product: newProduct })
    } catch (error) {
      console.error("Error al insertar producto:", error)
      res.status(500).json({ error: "Error al crear el producto" })
    }
  },
)
app.get("/api/products", async (req: Request, res: Response): Promise<void> => {
  try {
    // Recupera todos los productos de la base de datos
    const products = await db.selectFrom("products").selectAll().execute() // Suponiendo que 'products' es el nombre de tu tabla

    // Responde con el estado 200 y los productos
    res.status(200).json({ products })
  } catch (error) {
    // Si hay un error en la base de datos, responde con el estado 500
    console.error("Error al obtener productos:", error)
    res.status(500).json({ error: "Error al obtener los productos" })
  }
})

app.delete("/api/products/:referenceNumber", async (req: Request, res: Response): Promise<void> => {
  const referenceNumber = Number(req.params.referenceNumber) // Convertir a número

  if (isNaN(referenceNumber)) {
    res.status(400).json({ error: "El número de referencia debe ser un número válido" })
    return
  }

  try {
    const deletedProduct = await db
      .deleteFrom("products")
      .where("reference_number", "=", referenceNumber) // Ahora es un número
      .executeTakeFirst()

    if (!deletedProduct) {
      res.status(404).json({ error: "Producto no encontrado" })
      return
    }

    res.status(200).json({ message: "Producto eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar el producto:", error)
    res.status(500).json({ error: "Error al eliminar el producto" })
  }
})

app.get("/api/products/:referenceNumber", async (req: Request, res: Response): Promise<void> => {
  const referenceNumber = Number(req.params.referenceNumber) // Convertir a número
  try {
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("reference_number", "=", referenceNumber) // Ahora es un número
      .executeTakeFirst()

    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" })
      return
    }

    res.status(200).json({ product })
  } catch (error) {
    console.error("Error al obtener el producto:", error)
    res.status(500).json({ error: "Error al obtener el producto" })
  }
})

app.get("/api/carrito", async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.headers['userid']);
  console.log("🛒 Obteniendo carrito para el usuario:", userId);
  try {
    
    const cart = await db
      .selectFrom("shopping_cart")
      .select(["id", "product_id", "quantity"])
      .where("user_id", "=", userId) // Filtramos solo por este usuario
      .execute();

    console.log(cart)
    res.status(200).json({ cart })
  } catch (error) {
    console.error("Error al obtener el carrito:", error)
    res.status(500).json({ error: "Error al obtener el carrito" })
  }
})

app.post("/api/carrito/comprar", async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.body

  try {
    const cart = await db
      .selectFrom("shopping_cart")
      .selectAll()
      .where("user_id", "=", user_id)
      .execute()

    if (cart.length === 0) {
      res.status(400).json({ error: "El carrito está vacío" })
      return
    }

    const products = await db.selectFrom("products").selectAll().execute()

    for (const item of cart) {
      const product = products.find((p) => p.reference_number === item.product_id)
      if (!product || product.stock < item.quantity) {
        res.status(400).json({ error: "No hay suficiente stock" })
        return
      }
    }

    // for (const item of cart) {
    //   const product = products.find((p) => p.reference_number === item.product_id)
    //   await db
    //     .update("products")
    //     .set("stock", product.stock - item.quantity)
    //     .where("reference_number", "=", item.product_id)
    //     .execute()
    // }

    await db.deleteFrom("shopping_cart").where("user_id", "=", user_id).execute()

    res.status(200).json({ message: "Compra realizada con éxito" })
  }
  catch (error) {
    console.error("Error al comprar:", error)
    res.status(500).json({ error: "Error al comprar" })
  }
}
)

function cleanupExpiredCartItems() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10 minutos
  console.log("Items to delete before:", tenMinutesAgo); // Ver qué fecha se está utilizando

  db.deleteFrom("shopping_cart")
    .where("created_at", "<", tenMinutesAgo)
    .execute()
    .then((result) => {
    })
    .catch((error) => {
    });
}


setInterval(() => {

  cleanupExpiredCartItems();
}, 60 * 1000); 


app.post(
  "/api/carrito/:referenceNumber",
  [body("quantity").isNumeric(), body("user_id").isNumeric()],
  async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req.body
    const referenceNumber = Number(req.params.referenceNumber)

    try {
      const productCart = await db
        .insertInto("shopping_cart")
        .values({
          product_id: referenceNumber,
          quantity: 1,
          user_id: user_id,
          created_at: new Date(), // Add current timestamp
        })
        .returningAll()
        .executeTakeFirst()
      res.status(201).json({ message: "Producto agregado al carrito", productCart })
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error)
      res.status(500).json({ error: "Error al agregar producto al carrito" })
    }
  },
)

app.delete("/api/carrito/:id", async (req: Request, res: Response): Promise<void> => {
 
  const id = Number(req.params.id)
  try {
    const deletedProduct = await db
      .deleteFrom("shopping_cart")
      .where("id", "=", id)
      .executeTakeFirst()
    if (!deletedProduct) {
      res.status(404).json({ error: "Producto no encontrado en el carrito" })
      return
    }
    res.status(200).json({ message: "Producto eliminado del carrito" })
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error)
    res.status(500).json({ error: "Error al eliminar producto del carrito" })
  }
})

app.patch("/api/carrito/:id", async (req: Request, res: Response): Promise<void> => {
  const cartItemId = Number(req.params.id);
  const { userId, product_id, quantity } = req.body;

  if (!cartItemId || !userId || !product_id || quantity < 1) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  console.log("📌 Actualizando cantidad:", { cartItemId, userId, product_id, quantity });

  try {
    const updatedCartItem = await db
      .updateTable("shopping_cart")
      .set({ quantity })
      .where("id", "=", cartItemId)
      .where("user_id", "=", userId)
      .where("product_id", "=", product_id)
      .executeTakeFirst();

    if (!updatedCartItem) {
      res.status(404).json({ error: "Producto no encontrado en el carrito" });
      return;
    }

    res.status(200).json({ message: "Cantidad actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar la cantidad:", error);
    res.status(500).json({ error: "Error al actualizar la cantidad" });
  }
});




// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`)
})

