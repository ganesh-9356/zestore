import express from "express";
const router = express.Router();


// DELETE: Remove cart item by ID
router.delete("/zestorecarts/:id",async (req, res) =>{
  const db = req.db;
  try {
    const id = parseInt(req.params.id);
    const result = await db.collection("zestorecarts").deleteOne({ id, sessionOrEmail: req.session.userId });

    if (result.deletedCount === 1){
      res.json({success:true,message:"Cart item deleted successfully.." });
    } else {
      res.status(404).json({ success: false, message: "Cart item not found" });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success : false, error: "Internal Server Error" });
  }
});

// POST: Add product to cart without session/email or custom id
router.post("/zestorecarts", async (req, res) => {
  const db = req.db;
  const { title, price, category, image, quantity, description } = req.body;

  // Get session ID or fallback
  const sessionOrEmail = req.session?.userId || req.body.sessionOrEmail || "guest";

  try {
    const result = await db.collection("zestorecarts").insertOne({
      title,
      price,
      category,
      image,
      quantity,
      description,
      sessionOrEmail,   // <-- Important
      addedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Cart product added successfully.",
      productId: result.insertedId
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ success: false, message: "Failed to add to cart." });
  }
});

// DELETE: Clear all cart items for session or user
router.delete("/zestorecarts/clear", async (req, res) => {
  const db = req.db;
  try {
    const result = await db.collection("zestorecarts").deleteMany({ sessionOrEmail: req.session.userId });
    res.json({ success: true, message: `${result.deletedCount} cart items deleted.` });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
});

// PUT: Update quantity (add or remove)
router.put("/zestorecarts/:id", async (req, res) => {
  const db = req.db;
  const id = parseInt(req.params.id);
  const { action } = req.body;
  const sessionOrEmail = req.session.userId;

  try {
    const cartsCollection = db.collection("zestorecarts");
    const cartItem = await cartsCollection.findOne({ id, sessionOrEmail });

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
      await cartsCollection.deleteOne({ id, sessionOrEmail });
    } else {
      await cartsCollection.updateOne(
        
        { $set: { quantity: updatedQty } }
      );
    }

    const updatedCart = await cartsCollection.find({ sessionOrEmail }).toArray();
    res.json(updatedCart);

  } catch (error) {
    console.error("PUT /zestorecarts/:id error", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT: Set quantity = 1 for all cart items
router.put("/zestorecarts-update-all-quantity", async (req, res) => {
  const db = req.db;

  try {
    const result = await db.collection("zestorecarts").updateMany(
      { sessionOrEmail: req.session.userId },
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