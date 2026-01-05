const express = require("express");
const cors = require("cors");
const path = require("path");
const sampleProducts = require("./sampleProducts");
const app = express();
const port = process.env.PORT || 3000;

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "farmFresh.db");
let db = null;

const createTables = async () => {
  await db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT,
      in_stock INTEGER DEFAULT 1
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_name TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  console.log("Tables created successfully");
};

const insertSampleProducts = async () => {
  const result = await db.get(`SELECT COUNT(*) as count FROM products`);
  if (result.count > 0) {
    console.log("Sample products already exist in the database.");
    return;
  }
  for (const product of sampleProducts.products) {
    await db.run(
      `
            INSERT INTO products (name, price, image_url, category, in_stock)
            VALUES (?, ?, ?, ?, ?)
        `,
      [
        product.name,
        product.price,
        product.image_url,
        product.category,
        product.in_stock,
      ]
    );
  }
};

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    await createTables();
    await insertSampleProducts();
    app.listen(port, () => {
      console.log(`Server is running on port: https://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/products", async (req, res) => {
  try {
    const productsQuery = `Select * from products;`;
    const response = await db.all(productsQuery);
    res.status(200).json({ products: response });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const { buyer_name, delivery_address, items } = req.body;
    if (!buyer_name || !delivery_address) {
      return res
        .status(400)
        .send("Buyer name and delivery address are required");
    }
    if (!items || items.length === 0) {
      return res.status(400).send("Items are are required to place an order");
    }
    let total_amount = 0;
    for (const item of items) {
      const { product_id, quantity } = item;

      const productQuery = `Select price from products where id=${product_id};`;
      const productPrice = await db.get(productQuery);

      total_amount += productPrice.price * quantity;
    }
    // Inserting into orders table id totalamount status
    const createOrderQuery = `insert into orders (buyer_name, delivery_address, total_amount) 
    values ('${buyer_name}', '${delivery_address}', ${total_amount});`;
    const orderResponse = await db.run(createOrderQuery);
    const orderId = orderResponse.lastID;

    //inserting items to order_items table to list what items were ordered
    //id order_id product_id quantity price
    for (const item of items) {
      const { product_id, quantity } = item;
      const productPriceQuery = `Select price from products where id=${product_id};`;
      const productPrice = await db.get(productPriceQuery);

      const insertOrderItemQuery = `insert into order_items (order_id, product_id, quantity, price)
      values (${orderId}, ${product_id}, ${quantity}, ${productPrice.price});`;
      await db.run(insertOrderItemQuery);
    }
    res.status(201).json({
      order_id: orderId,
      message: "Order placed successfully",
      total_amount: total_amount,
      status: orders.status,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/orders/:orderId", async (req, res) => {
  //tracking order by orderid
  try {
    const { orderId } = req.params;
    const orderQuery = `Select * from orders where id=${orderId};`;
    const order = await db.get(orderQuery);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    const itemsQuery = `Select oi.product_id, p.name, oi.quantity, oi.price
    from order_items oi
    join products p on oi.product_id = p.id
    where oi.order_id=${orderId};`;
    const items = await db.all(itemsQuery);
    res.status(200).json({ order, items });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/admin/orders", async (req, res) => {
  try {
    const ordersQuery = `Select * from orders order by created_at desc;`;
    const orders = await db.all(ordersQuery);
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.put("/admin/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updateOrderQuery = `update orders set status='${status}' where id=${orderId};`;
    await db.run(updateOrderQuery);
    res.status(200).send("Order status updated successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
