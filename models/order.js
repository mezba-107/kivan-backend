import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null
},

userInfo: {
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true }
},


    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        size: String,     // ✅ ADD THIS
        image: String
      }
    ],

    totalAmount: {
      type: Number,
      required: true
    },

    // ✅ ORDER STATUS
    status: {
      type: String,
        enum: [
    "pending",
    "confirmed",
    "shipped",
    "out-for-delivery",
    "delivered",
    "returned",
    "cancelled"
  ],
      default: "pending"
    },
    

    shippingCharge: {
  type: Number,
  default: 0
},

cancelRequest: {
  requested: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending"
  }
},




paymentMethod: {
  type: String,
  default: "cod"
},

isGuest: {
  type: Boolean,
  default: false
},

  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
