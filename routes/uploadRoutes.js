import express from "express";
import upload from "../middleware/upload.js";
import protect from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

/**
 * ✅ PRODUCT + GALLERY IMAGE UPLOAD (Cloudinary)
 * Admin only
 * returns image URLs
 */
router.post(
  "/product",
  protect,
  isAdmin,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const urls = [];

      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });

        urls.push(result.secure_url);
      }

      res.status(201).json({
        success: true,
        images: urls,
      });
    } catch (err) {
      console.error("❌ UPLOAD ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
