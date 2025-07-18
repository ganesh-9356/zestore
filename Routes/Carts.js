import express from "express";
import { Db } from "mongodb";

const router = express.Router();

router.get("/carts", async (req,res)=>{
const db = req.db;
const cartsColl = await db.collection("carts").find().toArray();
res.send(cartsColl);
res.end();
});
router.get("/carts/:emailid", async (req,res)=>{
const db = req.db;
const cartsColl = await db.collection("carts").find({email:req.params.emailid}).toArray();
res.send(cartsColl);
res.end();
});


router.delete("/carts/:id", async (req, res) => {
  const db = req.db;
  try {
    const id = parseInt(req.params.id);
    const result = await db.collection("carts").deleteOne({ id: id }); // Match by `id` field

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


router.post("/carts", async (req,res)=>{
const db = req.db;
const {id,title,price,category,image,quantity,description} = req.body;
const cartsColl = await db.collection("carts").insertOne(
    {
  id,
  title, 
  price,
  category,
  image,
  quantity,
  description
}
);
res.send("Carts Products add..");
res.end()
});

export default router;