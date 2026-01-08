import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

/* ================================
   ✅ GET ALL PRODUCTS
================================ */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/* ================================
   ✅ GET SINGLE PRODUCT
================================ */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/* ================================
   ✅ CREATE PRODUCT
================================ */
export const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: req.body.image
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Product create failed" });
  }
};

/* ================================
   ✅ UPDATE PRODUCT (IMAGE SUPPORT)
================================ */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ basic update
    product.name = req.body.name;
    product.price = req.body.price;
    product.description = req.body.description;

    // ✅ image change check
    if (req.body.image && req.body.image !== product.image) {

      // delete old image file
if (product.image) {
  const oldPath = path.join(
    process.cwd(),
    "server",
    product.image
  );

  console.log("OLD IMAGE PATH:", oldPath);

  if (fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath);
  }
}



      product.image = req.body.image;
    }

    await product.save();

    res.json({
      message: "✅ Product updated",
      product
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================================
   ✅ DELETE PRODUCT (IMAGE DELETE)
================================ */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      // 🔥 DB value সরাসরি use
      const imgPath = path.join(
        process.cwd(),
        "server",
        product.image
      );

      console.log("DELETE PATH:", imgPath);

      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
        console.log("🗑️ image deleted");
      } else {
        console.log("❌ image not found");
      }
    }

    await product.deleteOne();
    res.json({ message: "✅ Product deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
