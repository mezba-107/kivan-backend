import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  productStats,
  removeGalleryImage, // ✅ ADD
} from "../controllers/productController.js";

import protect from "../middleware/auth.js";
import role from "../middleware/role.js"; // ✅ CHANGE
import upload from "../middleware/upload.js";

const router = express.Router();

// ===============================
// 👀 VIEW PRODUCTS
// Public (website product page)
// ===============================
router.get("/", getProducts);
router.get("/:id", getProductById);

// ===============================
// ➕ CREATE PRODUCT
// Admin + Moderator
// ===============================
router.post(
  "/",
  protect,
  role("admin", "moderator"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  createProduct
);

// ===============================
// ✏️ UPDATE PRODUCT
// Admin + Moderator
// ===============================
router.put(
  "/:id",
  protect,
  role("admin", "moderator"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  updateProduct
);

// ===============================
// 🖼️ REMOVE GALLERY IMAGE
// Admin + Moderator
// ===============================
router.delete(
  "/:id/gallery",
  protect,
  role("admin", "moderator"),
  removeGalleryImage
);

// ===============================
// 🗑️ DELETE PRODUCT
// Admin ONLY
// ===============================
router.delete(
  "/:id",
  protect,
  role("admin"),
  deleteProduct
);

// ===============================
// 📊 PRODUCT STATS
// Admin + moderator ONLY
// ===============================
router.get(
  "/admin/product-stats",
  protect,
  role("admin" , "moderator"),
  productStats
);

export default router;
