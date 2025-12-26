import express from "express";
import upload from "../middleware/upload.js";
import protect from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

/**
 * ✅ PRODUCT IMAGE UPLOAD
 * Admin only
 * returns image URL
 */
router.post(
  "/product",
  protect,
  isAdmin,
  upload.single("image"),
  (req, res) => {
    res.status(201).json({
      image: `/uploads/products/${req.file.filename}`,
    });
  }
);


// ===============================
// ✅ UPLOAD PRODUCT GALLERY
// ===============================

router.post(
  "/gallery",
  protect,
  isAdmin,
  upload.array("gallery", 5), // max 5 images
  (req, res) => {
    try {

      // 🔍 DEBUG LOGS (ADD THESE)
      console.log("GALLERY FILES:", req.files);
      console.log("GALLERY BODY:", req.body);

      const images = req.files.map(
        file => `/uploads/products/${file.filename}`
      );

      res.json({ images });

    } catch (err) {
      console.error("❌ GALLERY ERROR:", err); // 👈 ADD
      res.status(500).json({ message: "Gallery upload failed" });
    }
  }
);


export default router;
