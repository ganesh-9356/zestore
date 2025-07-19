import express from "express";
const router = express.Router();

// GET: Get all cart items
router.get("/carts", async (req, res) => {
  const db = req.db;
  const cartsColl = await db.collection("carts").find().toArray();
  res.send(cartsColl);
  res.end();
});

// GET: Get cart items by email
router.get("/carts/:emailid", async (req, res) => {
  const db = req.db;
  const cartsColl = await db.collection("carts").find({ email: req.params.emailid }).toArray();
  res.send(cartsColl);
  res.end();
});

// DELETE: Remove cart item by ID
router.delete("/carts/:id", async (req, res) => {
  const db = req.db;
  try {
    const id = parseInt(req.params.id);
    const result = await db.collection("carts").deleteOne({ id });

    if (result.deletedCount === 1) {
      res.json({ success: true, message: "Cart item deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Cart item not found" });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// POST: Add new cart item
router.post("/carts", async (req, res) => {
  const db = req.db;
  const { id, title, price, category, image, quantity, description, email } = req.body;

  await db.collection("carts").insertOne({
    id,
    title,
    price,
    category,
    image,
    quantity,
    description,
    email,
  });

  res.send("Cart product added.");
  res.end();
});


// Clear all cart items
router.delete("/carts/clear", async (req, res) => {
  const db = req.db;
  try {
    const result = await db.collection("carts").deleteMany({});
    res.json({ success: true, message: `${result.deletedCount} cart items deleted.` });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
});




// PUT: Update quantity (add or remove)
router.put("/carts/:id", async (req, res) => {
  const db = req.db;
  const id = parseInt(req.params.id);
  const { action } = req.body;

  try {
    const cartsCollection = db.collection("carts");
    const cartItem = await cartsCollection.findOne({ id });

    if (!cartItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    let updatedQty = cartItem.quantity || 1;

    if (action === "add") {
      updatedQty += 1;
    } else if (action === "remove") {
      updatedQty -= 1;
    }

    if (updatedQty <= 0) {
      await cartsCollection.deleteOne({ id });
    } else {
      await cartsCollection.updateOne(
        { id },
        { $set: { quantity: updatedQty } }
      );
    }

    // Return updated cart list
    const updatedCart = await cartsCollection.find().toArray();
    res.json(updatedCart);

  } catch (error) {
    console.error("PUT /carts/:id error", error);
    res.status(500).json({ error: "Server error" });
  }
});


// PUT: Set quantity = 1 for all cart items
router.put("/carts-update-all-quantity", async (req, res) => {
  const db = req.db;

  try {
    const result = await db.collection("carts").updateMany({}, { $set: { quantity: 1 } });
    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} items to quantity: 1`,
    });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});





export default router;
