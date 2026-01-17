import User from "../models/user.js";
import Order from "../models/order.js";

// ===============================
// GET ALL USERS (ADMIN)
// ===============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone city address role profileImage")
      .lean();

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const ordersCount = await Order.countDocuments({
          user: user._id
        });

        return {
          ...user,
          orders: ordersCount
        };
      })
    );

    res.json(usersWithOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ===============================
// UPDATE USER ROLE
// ===============================
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  // safety check
  if (!["admin", "moderator", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getOrdersByUserAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    const orders = await Order.find({ user: userId })
    
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


