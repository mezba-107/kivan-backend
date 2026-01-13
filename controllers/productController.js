import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";

/* ===== GET ALL PRODUCTS ===== */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/* ===== GET SINGLE PRODUCT ===== */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/* ===== CREATE PRODUCT ===== */

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    if (!req.files?.image) {
      return res.status(400).json({ message: "Main image required" });
    }

    const mainImage = req.files.image[0];

    const galleryImages = req.files.gallery
      ? req.files.gallery.map((file) => ({
          url: file.path,
          public_id: file.filename,
        }))
      : [];

    const product = await Product.create({
      name,
      price,
      description,
      category,
      image: {
        url: mainImage.path,
        public_id: mainImage.filename,
      },
      gallery: galleryImages,
    });

    res.status(201).json(product);

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Product create failed" });
  }
};




/* ===== UPDATE PRODUCT ===== */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.name = req.body.name ?? product.name;
    product.price = req.body.price ?? product.price;
    product.description = req.body.description ?? product.description;
    // ❌ category frontend থেকে পাঠাচ্ছ না, তাই safe রাখছি
    product.category = product.category;

    // ✅ MAIN IMAGE UPDATE
    if (req.files?.image) {
      if (product.image?.public_id) {
        await cloudinary.uploader.destroy(product.image.public_id);
      }

      product.image = {
        url: req.files.image[0].path,
        public_id: req.files.image[0].filename, // ✅ FIX
      };
    }

    // ✅ GALLERY UPDATE
    if (req.files?.gallery) {
      if (product.gallery?.length) {
        for (let img of product.gallery) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }

      product.gallery = req.files.gallery.map((file) => ({
        url: file.path,
        public_id: file.filename, // ✅ FIX
      }));
    }

    await product.save();
    res.json({ message: "✅ Product updated", product });

  } catch (err) {
    console.error("UPDATE ERROR →", err);
    res.status(500).json({ message: "Update failed" });
  }
};


/* ===== DELETE PRODUCT (FIXED) ===== */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // ✅ SAFE main image delete
    if (product.image && product.image.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    // ✅ SAFE gallery delete
    if (Array.isArray(product.gallery)) {
      for (let img of product.gallery) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    await product.deleteOne();
    res.json({ message: "✅ Product & images deleted" });
  } catch (err) {
    console.error("DELETE ERROR →", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ===== ADMIN PRODUCT STATS ===== */
export const productStats = async (req, res) => {
  try {
    const products = await Product.find();

    const stats = {
      total: products.length,
      sneakers: 0,
      tshirt: 0,
      pant: 0,
      hoodie: 0,
    };

    products.forEach((p) => {
      if (stats[p.category] !== undefined) {
        stats[p.category]++;
      }
    });

    res.json(stats);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===== DELETE SINGLE GALLERY IMAGE (FIXED) ===== */
export const removeGalleryImage = async (req, res) => {
  try {
    const { imagePublicId } = req.body;
    if (!imagePublicId) {
      return res.status(400).json({ message: "imagePublicId required" });
    }

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    await cloudinary.uploader.destroy(imagePublicId);

    product.gallery = product.gallery.filter(
      (img) => img.public_id !== imagePublicId
    );

    await product.save();
    res.json({ message: "✅ Gallery image deleted", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gallery image delete failed" });
  }
};
