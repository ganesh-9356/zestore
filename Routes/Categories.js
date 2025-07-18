import express  from "express";


const router = express.Router();
router.use(express.json());
router.get("/categories", async(req,res)=>{
    const db = req.db;
    const categories = db.collection("Categories");
    const categoriesdata = await categories.find().toArray();
    res.send(categoriesdata);
});

router.get("/products/category/:category", async (req, res) => {
  try {
    const db = req.db;
    const products = db.collection("Products");
    const category = req.params.category;
    const productList = await products.find({ category }).toArray();
    if (productList.length === 0) {
      return res.status(404).json({ message: "No products found for this category." });
    }
    res.json(productList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


export default router;