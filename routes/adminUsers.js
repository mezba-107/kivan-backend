import express from "express";
import {
  getAllUsers,
  updateUserRole,
  getOrdersByUserAdmin,
} from "../controllers/adminUserController.js";

import auth from "../middleware/auth.js";
import role from "../middleware/role.js"; // ✅ NEW

const router = express.Router();

/* ===============================
   👥 GET ALL USERS
   Admin + Moderator
================================ */
router.get(
  "/users",
  auth,
  role("admin", "moderator"), // ✅ both can view
  getAllUsers
);

/* ===============================
   🔁 UPDATE USER ROLE
   ONLY ADMIN
================================ */
router.put(
  "/users/:id/role",
  auth,
  role("admin"), // 🔴 only admin
  updateUserRole
);

/* ===============================
   📦 GET ORDERS BY USER
   Admin + Moderator
================================ */
router.get(
  "/users/:id/orders",
  auth,
  role("admin", "moderator"),
  getOrdersByUserAdmin
);

export default router;
