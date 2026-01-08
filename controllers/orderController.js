import Order from "../models/order.js";
import User from "../models/user.js";
/*
=================================
 CREATE ORDER (user)
=================================
*/
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingCharge } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // logged-in user
    
const user = await User.findById(req.userId).select("name phone address");

if (!user) {
  return res.status(401).json({ message: "Invalid user token" });
}


    const newOrder = new Order({
      user: user._id,
      userInfo: {
        name: user.name,
        phone: user.phone,
        address: user.address,
      },
      items: items.map(i => ({ ...i })),
      totalAmount,
      shippingCharge,
      status: "pending", // ✅ default status
    });

    await newOrder.save();

    res.status(201).json({
      message: "✅ Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
=================================
 GET MY ORDERS (user)
=================================
*/
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/*
=================================
 GET ALL ORDERS (admin)
=================================
*/
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name phone address")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};




/*
=================================
UPDATE ORDER STATUS (admin)
=================================
*/
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // allowed status
    const allowedStatus = ["pending", "confirmed",  "shipped", "out-for-delivery", "returned", "delivered", "cancelled"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({
      message: "✅ Order status updated",
      status: order.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};






export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    res.json({ message: "✅ Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to delete order" });
  }
};


// ===============================
// ✅ CREATE GUEST ORDER
// ===============================
export const createGuestOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      items,
      totalAmount,
      shippingCharge,
      paymentMethod
    } = req.body;

    if (!name || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

   const order = new Order({
  user: null,
  userInfo: {
    name,
    phone,
    address
  },
  items,
  totalAmount,
  shippingCharge,
  paymentMethod,
  isGuest: true
});


    await order.save();

    res.status(201).json({
      success: true,
      message: "Guest order placed successfully",
      order
    });
  } catch (error) {
    console.error("Guest order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const getGuestOrders = async (req, res) => {
  try {
    const { phone } = req.params;

    const orders = await Order.find({
      isGuest: true,
      "userInfo.phone": phone
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};




