import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    description: {
      type: String
    },

    image: {
      type: String, // image path (uploads/xxx.jpg)
      required: true
    },

    gallery: [String],     // ✅ NEW gallery field

   category: {
  type: String,
  required: true,
},

  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
