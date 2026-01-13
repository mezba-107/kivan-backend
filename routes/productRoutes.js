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
import isAdmin from "../middleware/isAdmin.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

// ✅ image + gallery support
router.post(
  "/",
  protect,
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  createProduct
);

router.put(
  "/:id",
  protect,
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  updateProduct
);

// ✅ ADD: delete single gallery image
router.delete(
  "/:id/gallery",
  protect,
  isAdmin,
  removeGalleryImage
);

router.delete("/:id", protect, isAdmin, deleteProduct);
router.get("/admin/product-stats", protect, isAdmin, productStats);

export default router;
