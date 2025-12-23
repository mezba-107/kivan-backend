import express from "express";
import Product from "../models/productModel.js";
import protect from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import fs from "fs";
import path from "path";

const router = express.Router();

/* =====================================================
   ✅ GET ALL PRODUCTS
===================================================== */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "❌ Failed to get products" });
  }
});

/* =====================================================
   ✅ GET SINGLE PRODUCT
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "❌ Product not found" });
    res.json(product);
  } catch {
    res.status(500).json({ message: "❌ Failed to get product" });
  }
});

/* =====================================================
   ✅ ADD PRODUCT
===================================================== */
router.post("/", protect, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: "❌ Failed to add product" });
  }
});

/* =====================================================
   ✅ UPDATE PRODUCT (DELETE OLD IMAGE)
===================================================== */
router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const { name, price, image, description, gallery } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "❌ Product not found" });

    product.name = name;
    product.price = price;
    product.description = description;

    if (image && image !== product.image) {
      if (product.image) {
        const oldPath = path.join(
          process.cwd(),
          "server",
          product.image
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log("✅ Old image deleted:", oldPath);
        }
      }

      product.image = image;
    }

    // ✅ GALLERY UPDATE
if (gallery && Array.isArray(gallery)) {
  product.gallery = gallery;
}


    await product.save();
    res.json({ message: "✅ Product updated", product });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to update product" });
  }
});

/* =====================================================
   ✅ DELETE PRODUCT (DELETE IMAGE TOO)
===================================================== */
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product?.image) {
      const imgPath = path.join(
        process.cwd(),
        "server",
        product.image
      );

      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
        console.log("✅ Product image deleted:", imgPath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Product deleted" });

  } catch (err) {
    res.status(500).json({ message: "❌ Failed to delete product" });
  }
});

export default router;
