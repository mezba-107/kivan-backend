import Order from "../models/order.js";
import express from "express";

// ✅ controllers
import {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getGuestOrders
} from "../controllers/orderController.js";

// ✅ middleware
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

/*
==================================
USER ROUTES
==================================
*/

// ✅ guest create
router.post("/guest-create", createGuestOrder);

// ✅ guest orders (🔥 MUST BE BEFORE "/:id")
router.get("/guest-orders/:phone", getGuestOrders);

// ✅ Order create
router.post("/create", auth, createOrder);

// ✅ My orders
router.get("/my-orders", auth, getMyOrders);

/*
==================================
ADMIN ROUTES
==================================
*/

// ✅ Get all orders
router.get("/admin/all-orders", auth, isAdmin, getAllOrders);

// ✅ delete
router.delete("/admin/delete/:id", auth, isAdmin, deleteOrder);

// ✅ update status
router.put(
  "/admin/update-status/:orderId",
  auth,
  isAdmin,
  updateOrderStatus
);

// ===============================
// ✅ GET SINGLE ORDER (INVOICE)
// ===============================
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone address");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user && order.user._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GUEST INVOICE
router.get("/guest-invoice/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order || !order.isGuest) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router; // ✅ YES, last line always OK
