import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoConnect } from "./config/MongoDB.js";
import productsdata from "./Routes/Products.js";
import categoriesdata from "./Routes/Categories.js";
import zestoreregister from "./Routes/Register.js";
import zestorecarts from "./Routes/Carts.js";
import zestoreprofiles from "./Routes/Profiles.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();


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

// Routes
app.use("/", productsdata);
app.use("/", categoriesdata);
app.use("/", zestoreregister);
app.use("/", zestorecarts);
app.use("/", zestoreprofiles);

// --------------------------------------  🔐 Reset Password with OTP Flow  --------------------------------------------

// ✅ Temporary in-memory OTP store (You can replace with DB if needed)
const otpStore = {};

// ✅ Nodemailer Email Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.Email_Host,
  port: process.env.Email_Port,
  secure: true,
  auth: {
    user: process.env.Send_Email,
    pass: process.env.Email_Pass,
  },
});

// ✅ Send OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, createdAt: Date.now(), verified: false };

  try {
    await transporter.sendMail({
      from: process.env.Send_Email,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP for password reset is: ${otp}`,
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    res.send({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).send({ error: "Failed to send OTP", details: error });
  }
});

// ✅ Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record) {
    return res.status(400).send({ error: "OTP expired or not found" });
  }

  const { otp: storedOtp, createdAt } = record;

  // OTP expires after 5 minutes (300,000 ms)
  if (Date.now() - createdAt > 5 * 60 * 1000) {
    delete otpStore[email]; // remove expired OTP
    return res.status(400).send({ error: "OTP expired" });
  }

  if (storedOtp !== otp) {
    return res.status(400).send({ error: "Invalid OTP" });
  }

  otpStore[email].verified = true;
  delete otpStore[email]; // Optional: delete OTP after verification

  res.send({ message: "OTP verified successfully" });
});


// ✅ Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  const record = otpStore[email];

  if (!record || !record.verified) {
    return res.status(400).send({ error: "OTP not verified or expired" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.collection("UserLogin").updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({ error: "User not found or password unchanged" });
    }

    delete otpStore[email]; // Clean up OTP after success
    res.send({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).send({ error: "Failed to reset password", details: err.message });
  }
});

// -------------------------------------- Start Server --------------------------------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
});
