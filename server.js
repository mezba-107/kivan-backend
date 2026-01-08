import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminOrdersRoute from "./routes/adminOrders.js";
import ratingRoutes from "./routes/ratingRoutes.js";

dotenv.config({ path: "./server/.env" });

const app = express();

// ✅ ES module fix for __dirname (UNCHANGED)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================================================
// ✅ AUTO CREATE UPLOAD FOLDERS (JUST THIS PART ADDED)
// ==================================================
const folders = [
  path.join(__dirname, "uploads"),
  path.join(__dirname, "uploads/products"),
  path.join(__dirname, "uploads/gallery"),
];

folders.forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

// ==================================================

// ✅ MIDDLEWARE (UNCHANGED)
app.use(
  cors({
    origin: ["https://ki-van-2.netlify.app"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ uploads folder public
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ ROUTES (UNCHANGED)
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orders", adminOrdersRoute);
app.use("/api/ratings", ratingRoutes);

const PORT = process.env.PORT || 5000;

// ✅ DB CONNECT (UNCHANGED)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ✅ SERVER START (UNCHANGED)
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
