import express from "express";
import { Db } from "mongodb";

const router = express.Router();


router.get("/profiles", async (req,res)=>{
const db = req.db;
const cartsColl = await db.collection("profiles").find().toArray();
res.send(cartsColl);
res.end();
});
router.post("/profiles", async (req, res) => {
  const db = req.db;
  try {
    const {
      fullName,
      phone,
      email,
      address,
      city,
      pincode
    } = req.body;

    const profile = {
      fullName,
      phone,
      email,
      address,
      city,
      pincode
    };

    await db.collection("profiles").insertOne(profile);

    res.send("Profile uploaded successfully...");
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send("Failed to upload profile.");
  }
});



router.delete("/profiles/:pincode", async (req, res) => {
  const db = req.db;
  try {
    const pincode = req.params.id;

    const result = await db.collection("profiles").deleteOne({
      pincode: pincode
    });

    if (result.deletedCount === 1) {
      res.send("Profile deleted successfully.");
    } else {
      res.status(404).send("Profile not found.");
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Failed to delete profile.");
  }
});


export default router;