import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    message: String,

    // 🔥 NEW
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
