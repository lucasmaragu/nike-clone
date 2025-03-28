import express, { type Request, type Response } from "express"
import db from "./index"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import cors from "cors"
import { verifyToken, checkRole } from "../middleware/authMiddleware";

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
  const { user_id, totalAmount } = req.body;

  try {
    // Obtener el carrito de compras del usuario
    const cart = await db
      .selectFrom("shopping_cart")
      .selectAll()
      .where("user_id", "=", user_id)
      .execute();

    if (cart.length === 0) {
      res.status(400).json({ error: "El carrito está vacío" });
      return;
    }

    // Crear un registro de compra en la tabla 'shopping'
    const shopping = await db
      .insertInto("shopping")
      .values({
        user_id: user_id,
        total_price: totalAmount.toFixed(2),
        created_at: new Date(),
      })
      .returning("id")
      .execute();

    const shoppingId = shopping[0]?.id;

    // Obtener los precios de los productos en el carrito
    const productIds = cart.map((item) => item.product_id);
    const products = await db
      .selectFrom("products")
      .select(["reference_number", "price", "stock"])
      .where("reference_number", "in", productIds)
      .execute();

    if (shoppingId === undefined) {
      throw new Error("No se pudo obtener el ID del carrito de compras.");
    }
    // Mapear los items del carrito con su precio
    const shopping_items = cart.map((item) => {
      const product = products.find((p) => p.reference_number === item.product_id);
      if (!product) {
        throw new Error(`Producto con ID ${item.product_id} no encontrado`);
      }

      // Verificar stock disponible
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto con ID ${item.product_id}`);
      }

      return {
        shopping_id: shoppingId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price * item.quantity,
      };
    });

    // Iniciar una transacción para garantizar la integridad de los datos
    await db.transaction().execute(async (trx) => {
      // Insertar los productos en la tabla 'shopping_item'
      await trx.insertInto("shopping_item").values(shopping_items).execute();

      // Actualizar el stock de los productos
      for (const item of cart) {
        await trx
          .updateTable("products")
          .set((eb) => ({
            stock: eb("stock", "-", item.quantity)
          }))
          .where("reference_number", "=", item.product_id)
          .execute();
      }

      // Eliminar los productos del carrito una vez realizada la compra
      await trx.deleteFrom("shopping_cart").where("user_id", "=", user_id).execute();
    });

    res.status(200).json({
      message: "Compra realizada con éxito",
      shopping_id: shoppingId
    });
  } catch (error) {
    console.error("Error al comprar:", error);

    // Proporcionar un mensaje de error más específico
    const errorMessage = error instanceof Error ? error.message : "Error al procesar la compra";
    res.status(500).json({ error: errorMessage });
  }
});


function cleanupExpiredCartItems() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10 minutos atrás
  console.log("Items to delete before:", tenMinutesAgo.toLocaleString()); // Ver qué fecha se está utilizando

  db.deleteFrom("shopping_cart")
    .where("created_at", "<", tenMinutesAgo)
    .execute()
    .then((result) => {
      console.log("Expired items deleted:", result);
    })
    .catch((error) => {
      console.error("Error deleting expired items:", error);
    });
}

// Ejecutar cada 1 minuto (60,000 ms)
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

app.put("/api/carrito/:id", async (req: Request, res: Response): Promise<void> => {
  const cartItemId = Number(req.params.id);
  const { userId, product_id, quantity } = req.body;

  if (!cartItemId || !userId || !product_id || quantity < 1) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  console.log("📌 Reemplazando cantidad:", { cartItemId, userId, product_id, quantity });

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

    res.status(200).json({ message: "Cantidad reemplazada correctamente" });
  } catch (error) {
    console.error("❌ Error al reemplazar la cantidad:", error);
    res.status(500).json({ error: "Error al reemplazar la cantidad" });
  }
});


app.get("/api/compras", async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.headers['userid']);
  console.log("🛍 Obteniendo compras para el usuario:", userId)
  try {
    const purchases = await db
      .selectFrom("shopping")
      .selectAll()
      .where("user_id", "=", userId)
      .execute()
    res.status(200).json({ purchases })
  } catch (error) {
    console.error("Error al obtener compras:", error)
    res.status(500).json({ error: "Error al obtener las compras" })
  }
})
app.get("/api/compras/:id/items", async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.headers["userid"])
  console.log("📦 Obteniendo items de la compra para el usuario:", userId)
  const shoppingId = Number(req.params.id)

  try {
    // Primero verificamos que la compra pertenezca al usuario
    const purchase = await db
      .selectFrom("shopping")
      .selectAll()
      .where("id", "=", shoppingId)
      .where("user_id", "=", userId)
      .executeTakeFirst()

    if (!purchase) {
      res.status(404).json({ error: "Compra no encontrada" })
      return
    }

    // Obtenemos los items de la compra
    const items = await db
      .selectFrom("shopping_item")
      .leftJoin("products", "products.reference_number", "shopping_item.product_id")
      .select([
        "shopping_item.id",
        "shopping_item.shopping_id",
        "shopping_item.product_id",
        "shopping_item.quantity",
        "shopping_item.price",
      ])
      // Seleccionamos los campos del producto individualmente
      .select([
        "products.reference_number as product_reference_number",
        "products.name as product_name",
        "products.description as product_description",
        "products.price as product_price",
        "products.type as product_type",
        "products.image_url as product_image_url",
        "products.on_sale as product_on_sale",
        "products.stock as product_stock"
      ])
      .where("shopping_id", "=", shoppingId)
      .execute()

    // Transformamos los resultados para tener la estructura deseada
    const transformedItems = items.map(item => {
      // Solo creamos el objeto product si tenemos al menos el reference_number
      const product = item.product_reference_number ? {
        reference_number: item.product_reference_number,
        name: item.product_name,
        description: item.product_description,
        price: item.product_price,
        type: item.product_type,
        image_url: item.product_image_url,
        on_sale: item.product_on_sale,
        stock: item.product_stock
      } : undefined;

      // Devolvemos el item con la estructura correcta
      return {
        id: item.id,
        shopping_id: item.shopping_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product
      };
    });

    res.status(200).json({ items: transformedItems })
  } catch (error) {
    console.error("Error al obtener items de la compra:", error)
    res.status(500).json({ error: "Error al obtener los items de la compra" })
  }
})

// Añadir estos endpoints al archivo server.ts

// Obtener perfil de usuario
app.get("/api/profile", async (req: Request, res: Response): Promise<void> => {
  // Obtener el ID del usuario del token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string, role: string };
    const userId = decoded.id;

    const user = await db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ error: "Error al obtener el perfil del usuario" });
  }
});

// Actualizar perfil de usuario
app.put(
  "/api/profile",
  [
    body("email").isEmail().optional(),
    body("role").isString().optional(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Obtener el ID del usuario del token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string, role: string };
      const userId = decoded.id;
      const { email, role } = req.body;

      // Verificar si el email ya está en uso por otro usuario
      if (email) {
        const existingUser = await db
          .selectFrom("users")
          .select("id")
          .where("email", "=", email)
          .where("id", "!=", userId)
          .executeTakeFirst();

        if (existingUser) {
          res.status(400).json({ error: "El correo electrónico ya está en uso" });
          return;
        }
      }

      // Actualizar el perfil
      const updatedUser = await db
        .updateTable("users")
        .set({
          ...(email && { email }),
          ...(role && { role })
        })
        .where("id", "=", userId)
        .returningAll()
        .executeTakeFirst();

      if (!updatedUser) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      res.status(500).json({ error: "Error al actualizar el perfil del usuario" });
    }
  }
);

// Cambiar contraseña
app.put(
  "/api/profile/password",
  [body("currentPassword").isString().notEmpty(), body("newPassword").isString().isLength({ min: 6 })],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    // Obtener el ID del usuario del token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ error: "No autorizado" })
      return
    }

    try {
      const token = authHeader.split(" ")[1]
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string }
      const userId = decoded.id
      const { currentPassword, newPassword } = req.body

      // Obtener el usuario con su contraseña actual
      const user = await db.selectFrom("users").select(["id", "password"]).where("id", "=", userId).executeTakeFirst()

      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" })
        return
      }

      // Verificar que la contraseña actual sea correcta
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        res.status(400).json({ error: "La contraseña actual es incorrecta" })
        return
      }

      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Actualizar la contraseña
      await db
        .updateTable("users")
        .set({
          password: hashedPassword,
        })
        .where("id", "=", userId)
        .execute()

      res.status(200).json({ message: "Contraseña actualizada correctamente" })
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)
      res.status(500).json({ error: "Error al cambiar la contraseña" })
    }
  },
)


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`)
})

