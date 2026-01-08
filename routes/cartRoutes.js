import express from "express";
import protect from "../middleware/auth.js";
import { addToCart, getMyCart, removeFromCart, updateCartQty } from "../controllers/cartController.js";

const router = express.Router();

// ADD TO CART (LOGIN USER)
router.post("/add", protect, addToCart);

// GET MY CART (LOGIN USER)
router.get("/", protect, getMyCart);

// REMOVE ITEM FROM CART (LOGIN USER)
router.delete("/remove/:productId", protect, removeFromCart);

// UPDATE CART QTY
router.put("/update", protect, updateCartQty);



export default router;
