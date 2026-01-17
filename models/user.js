import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },


role: {
  type: String,
  enum: ["user", "moderator", "admin"],
  default: "user",
},



profileImage: {
  url: {
    type: String,
    default: "",
  },
  public_id: {
    type: String,
    default: "",
  },
},


  phone: { type: String, default: "" },    // FIXED

  city: { type: String, default: "" },
  
  address: { type: String, default: "" },

  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

export default mongoose.model("User", userSchema);
