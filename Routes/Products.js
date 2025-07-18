import express from "express";
const routes = express.Router();
routes.use(express.json());

// ---------- CREATE (POST) ----------
routes.post("/products", async (req, res) => {
  const db = req.db;
  const { id, title, price, category, description, image, quantity } = req.body;

  const product = {
    id: parseFloat(id),
    title,
    price: parseFloat(price),
    category,
    description,
    quantity: parseInt(quantity),
    image // this should be a URL or base64 string now
  };

  try {
    await db.collection("Products").insertOne(product);
    res.send("Product created.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to create product.");
  }
});

// ---------- READ (GET) ----------
routes.get("/products", async (req, res) => {
  const db = req.db;
  const products = await db.collection("Products").find().toArray();
  res.send(products);
});

routes.get("/products/:id", async (req, res) => {
  const db = req.db;
  const product = await db.collection("Products").findOne({ id: parseFloat(req.params.id) });
  if (product) res.send(product);
  else res.status(404).send("Product not found.");
});

// ---------- UPDATE (PUT) ----------
routes.put("/products/:id", async (req, res) => {
  try {
    const id = parseFloat(req.params.id);
    const db = req.db;

    const updateResult = await db.collection("Products").updateOne(
      { id: id },
      {
        $set: {
          title: req.body.title,
          price: parseFloat(req.body.price),
          category: req.body.category,
          description: req.body.description,
          image: req.body.image,
          quantity: parseInt(req.body.quantity)
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).send("Product not found.");
    }

    res.send("Product updated successfully.");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("An error occurred while updating the product.");
  }
});

// ---------- PATCH (partial update) ----------
routes.patch("/products/:id", async (req, res) => {
  const db = req.db;
  const updates = req.body;

  if ("price" in updates) updates.price = parseFloat(updates.price);
  if ("quantity" in updates) updates.quantity = parseInt(updates.quantity);

  const result = await db.collection("Products").updateOne(
    { id: parseFloat(req.params.id) },
    { $set: updates }
  );

  res.send(result.modifiedCount ? "Product patched." : "Product not found.");
});

// ---------- DELETE ----------
routes.delete("/products/:id", async (req, res) => {
  const db = req.db;
  const id = parseFloat(req.params.id);

  const product = await db.collection("Products").findOne({ id });
  if (!product) return res.status(404).send("Product not found.");

  await db.collection("Products").deleteOne({ id });
  res.send("Product deleted.");
});

export default routes;
