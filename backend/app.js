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
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'PLACED',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
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
    res.json({ products: response }).status(200);
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});
