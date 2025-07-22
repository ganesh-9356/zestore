import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoConnect } from "./config/MongoDB.js";
import productsdata from "./Routes/Products.js";
import categoriesdata from "./Routes/Categories.js";
import register from "./Routes/Register.js";
import carts from "./Routes/Carts.js";
import profiles from "./Routes/Profiles.js";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 6000;
console.log("OK");
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


//--------------------------------------  reset Password  --------------------------------------------


// Configure Email Transporter
 const transporter = nodemailer.createTransport({
        host: process.env.Email_Host ,
        port: process.env.Email_Port ,
        secure: true,
        auth: {
            user: process.env.Send_Email,
            pass: process.env.Email_Pass, // Replace with your App Password
        },
    });

// Store OTPs temporarily (Ideally, store in DB)
const otpStore = {};



// ✅ 1. Send OTP to User's Email
app.post("/send-otp", (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    otpStore[email] = otp; // Save OTP temporarily
console.log(otp)
    // Send OTP via Email
    transporter.sendMail({
        from: process.env.Send_Email,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP is: ${otp}`,
    }, (err, info) => { 
        if (err) return res.status(500).send({ error: "Failed to send OTP", details: err });
        res.send({ message: "OTP sent successfully" });
        console.log("Sending OTP to:", email);
console.log("Configured email:", process.env.Send_Email);

    });
});



// ✅ 2. Verify OTP
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    if (otpStore[email] && otpStore[email] === otp) {
        res.send({ message: "OTP Verified" });
    } else {
        res.status(400).send({ error: "Invalid OTP" });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 