import express from "express";
const router = express.Router();

// ✅ POST: Add product to cart with user email
router.post("/zestorecarts", async (req, res) => {
  const db = req.db;
  const { id, title, price, category, image, quantity, description, email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const result = await db.collection("zestorecarts").insertOne({
      id,
      title,
      price,
      category,
      image,
      quantity,
      description,
      email,
      addedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Cart item successfully added.",
      productId: result.insertedId
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ success: false, message: "Failed to add to cart." });
  }
});

// ✅ GET: Fetch cart items for a specific email
router.get("/zestorecarts", async (req, res) => {
  const db = req.db;
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const cartItems = await db.collection("zestorecarts").find({ email }).toArray();
    res.json(cartItems);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch cart." });
  }
});

// ✅ DELETE: Remove cart item by ID and email
router.delete("/zestorecarts/:id", async (req, res) => {
  const db = req.db;
  const id = parseInt(req.params.id);
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const result = await db.collection("zestorecarts").deleteOne({ id, email });

    if (result.deletedCount === 1) {
      res.json({ success: true, message: "Cart item deleted successfully." });
    } else {
      res.status(404).json({ success: false, message: "Cart item not found" });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ✅ DELETE: Clear cart for a specific email
router.delete("/zestorecarts/clear", async (req, res) => {
  const db = req.db;
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const result = await db.collection("zestorecarts").deleteMany({ email });
    res.json({ success: true, message: `${result.deletedCount} cart items deleted.` });
  } catch (err) {
    console.error("Clear error:", err);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
});

// ✅ PUT: Update quantity (add or remove) for specific email
router.put("/zestorecarts/:id", async (req, res) => {
  const db = req.db;
  const id = parseInt(req.params.id);
  const { action, email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const cartsCollection = db.collection("zestorecarts");
    const cartItem = await cartsCollection.findOne({ id, email });

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
      await cartsCollection.deleteOne({ id, email });
    } else {
      await cartsCollection.updateOne(
        { id, email },
        { $set: { quantity: updatedQty } }
      );
    }

    const updatedCart = await cartsCollection.find({ email }).toArray();
    res.json(updatedCart);
  } catch (error) {
    console.error("PUT error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ PUT: Set quantity = 1 for all items for a specific user
router.put("/zestorecarts-update-all-quantity", async (req, res) => {
  const db = req.db;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const result = await db.collection("zestorecarts").updateMany(
      { email },
      { $set: { quantity: 1 } }
    );
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
