import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoConnect } from "./config/MongoDB.js";
import productsdata from "./Routes/Products.js";
import categoriesdata from "./Routes/Categories.js";
import register from "./Routes/Register.js";
import carts from "./Routes/Carts.js";
import profiles from "./Routes/Profiles.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 6000;

// MongoDB connection
const db = await MongoConnect();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Attach DB to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// 🔴 REMOVE static image folder (no file access anymore)
// app.use("/images", express.static("./images"));

// Routes
app.use("/", productsdata);
app.use("/", categoriesdata);
app.use("/", register);
app.use("/", carts);
app.use("/", profiles);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 