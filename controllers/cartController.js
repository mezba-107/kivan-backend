import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js"; // ⚠️ price secure করার জন্য

// ================= ADD TO CART =================
export const addToCart = async (req, res) => {
  try {
    const { productId, qty, size } = req.body;
    const userId = req.user.id;

    // ✅ validations
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (!qty || qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    if (!size) {
      return res.status(400).json({ message: "Please select a size" });
    }

    // 🔐 secure price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // 🆕 new cart
      cart = new Cart({
        user: userId,
        items: [
          {
            product: product._id,
            qty,
            price: product.price,
            size, // ✅
          },
        ],
      });
    } else {
      // 🛒 existing cart
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.size === size // 🔥 same product + same size
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].qty += qty;
      } else {
        cart.items.push({
          product: product._id,
          qty,
          price: product.price,
          size, // ✅
        });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= GET MY CART =================
export const getMyCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({ items: [] });
    }


    res.status(200).json(cart);
  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// ================= REMOVE ITEM FROM CART =================
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { size } = req.query; // Thunder Client থেকে পাঠাবে

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

cart.items = cart.items.filter(
  (item) =>
    !(
      item.product.toString() === productId &&
      item.size === size
    )
);


    await cart.save();

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= UPDATE CART QTY =================
export const updateCartQty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, qty, size } = req.body;

    if (!productId || !qty) {
      return res.status(400).json({ message: "Missing data" });
    }

    if (qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      i =>
        i.product.toString() === productId &&
        i.size === size
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.qty = qty;
    await cart.save();

    res.json({ message: "Quantity updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
