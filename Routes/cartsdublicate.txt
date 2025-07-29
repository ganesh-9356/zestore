import express from "express";
const router = express.Router();

// ✅ DELETE: Remove cart item by ID
router.delete("/zestorecarts/:id", async (req, res) => {
  const db = req.db;
  try {
    const id = parseInt(req.params.id);
    const result = await db.collection("zestorecarts").deleteOne({ id });

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

// ✅ POST: Add product to cart (No session/email)
router.post("/zestorecarts", async (req, res) => {
  const db = req.db;
  const { id, title, price, category, image, quantity, description } = req.body;

  try {
    const result = await db.collection("zestorecarts").insertOne({
      id,
      title,
      price,
      category,
      image,
      quantity,
      description,
      addedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Cart item successfully added.",
      productId: result.insertedId
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add to cart.",
      error: err.message
    });
  }
});

// ✅ GET: Fetch all cart items
router.get("/zestorecarts", async (req, res) => {
  const db = req.db;
  try {
    const cartItems = await db.collection("zestorecarts").find().toArray();
    res.json(cartItems);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch cart." });
  }
});

// ✅ DELETE: Clear entire cart (no session)
router.delete("/zestorecarts/clear", async (req, res) => {
  const db = req.db;
  try {
    const result = await db.collection("zestorecarts").deleteMany({});
    res.json({ success: true, message: `${result.deletedCount} cart items deleted.` });
  } catch (err) {
    console.error("Clear error:", err);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
});

// ✅ PUT: Update quantity (add or remove)
router.put("/zestorecarts/:id", async (req, res) => {
  const db = req.db;
  const id = parseInt(req.params.id);
  const { action } = req.body;

  try {
    const cartsCollection = db.collection("zestorecarts");
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

    const updatedCart = await cartsCollection.find().toArray();
    res.json(updatedCart);

  } catch (error) {
    console.error("PUT error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ PUT: Set quantity = 1 for all cart items
router.put("/zestorecarts-update-all-quantity", async (req, res) => {
  const db = req.db;
  try {
    const result = await db.collection("zestorecarts").updateMany(
      {},
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
