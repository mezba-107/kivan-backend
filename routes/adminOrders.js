import express from "express";
import Order from "../models/order.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ==============================
   📊 ADMIN ORDER COUNT
============================== */
router.get("/admin/order-stats", auth, async (req, res) => {
  try {
    const total = await Order.countDocuments();


    const pending = await Order.countDocuments({ status: "pending" });
    const confirmed = await Order.countDocuments({ status: "confirmed" });
    const shipped = await Order.countDocuments({ status: "shipped" });
    const outForDelivery = await Order.countDocuments({ status: "out-for-delivery" });
    const delivered = await Order.countDocuments({ status: "delivered" });
    const returned = await Order.countDocuments({ status: "returned" });
    const cancelled = await Order.countDocuments({ status: "cancelled" });


res.json({
  total,
  pending,
  confirmed,
  shipped,
  outForDelivery,
  delivered,
  returned,
  cancelled
  
});


  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
