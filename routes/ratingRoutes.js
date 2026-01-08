import express from "express";
import mongoose from "mongoose";
import Rating from "../models/MRating.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/**
 * ⭐ Submit Rating
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, rating } = req.body;
    const userId = req.userId; // ✅ FIXED

    if (!productId || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const alreadyRated = await Rating.findOne({ productId, userId });
    if (alreadyRated) {
      return res.status(400).json({ message: "You already rated this product" });
    }

    const newRating = new Rating({
      productId,
      userId,
      rating,
    });

    await newRating.save();

    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ⭐ Get average rating by product
router.get("/:productId", async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.productId);

    const result = await Rating.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          total: { $sum: 1 },
        },
      },
    ]);

    res.json(result[0] || { avgRating: 0, total: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
