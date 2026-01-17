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
  getGuestOrders,
  getOrdersByUser
} from "../controllers/orderController.js";

// ✅ middleware
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

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
ADMIN / MODERATOR ROUTES
==================================
*/

// ✅ Get all orders (Admin + Moderator)
router.get(
  "/admin/all-orders",
  auth,
  role("admin", "moderator"),
  getAllOrders
);

// ✅ update status (Admin + Moderator)
router.put(
  "/admin/update-status/:orderId",
  auth,
  role("admin", "moderator"),
  updateOrderStatus
);

/*
==================================
ADMIN ONLY ROUTES
==================================
*/

// ✅ delete order (Admin only)
router.delete(
  "/admin/delete/:id",
  auth,
  role("admin"),
  deleteOrder
);

// ===============================
// ✅ ADMIN – APPROVE CANCEL REQUEST
// ===============================
router.put(
  "/admin/cancel-request/approve/:orderId",
  auth,
  role("admin", "moderator"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId);

      if (!order || !order.cancelRequest?.requested) {
        return res.status(404).json({ message: "Cancel request not found" });
      }

      order.cancelRequest.status = "approved";
      order.status = "cancelled";

      await order.save();

      res.json({ message: "Cancel request approved" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===============================
// ✅ ADMIN – DECLINE CANCEL REQUEST
// ===============================
router.put(
  "/admin/cancel-request/decline/:orderId",
  auth,
  role("admin", "moderator"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId);

      if (!order || !order.cancelRequest?.requested) {
        return res.status(404).json({ message: "Cancel request not found" });
      }

      order.cancelRequest.status = "declined";

      await order.save();

      res.json({ message: "Cancel request declined" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===============================
// ✅ ADMIN – PENDING COUNT
// ===============================
router.get(
  "/admin/pending-count",
  auth,
  role("admin", "moderator"),
  async (req, res) => {
    try {
      const count = await Order.countDocuments({ status: "pending" });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===============================
// ✅ ADMIN – USER ORDERS
// ===============================
router.get(
  "/user/:userId",
  auth,
  role("admin"),
  getOrdersByUser
);

// ===============================
// ✅ GET SINGLE ORDER (INVOICE)
// USER (own) + ADMIN + MODERATOR
// ===============================
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone address");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner =
      order.user &&
      order.user._id.toString() === req.user.id.toString();

    const isAdminOrMod =
      req.user.role === "admin" || req.user.role === "moderator";

    if (!isOwner && !isAdminOrMod) {
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
})

// ===============================
// ✅ USER – CANCEL REQUEST
// ===============================
router.post("/cancel-request/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.cancelRequest = {
      requested: true,
      reason: req.body.reason || "",
      status: "pending"
    };

    await order.save();

    res.json({ message: "Cancel request sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
