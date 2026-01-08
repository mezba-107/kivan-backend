import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// ===================== SIGNUP =====================
export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// ===================== LOGIN =====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
  {
    userId: user._id,
    role: user.role, // ✅ ADD THIS
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);


    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    address: user.address,
  },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};





// Update username
export const updateName = async (req, res) => {
  try {
    const { id, name } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    res.json({ success: true, name: user.name });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Update phone
export const updatePhone = async (req, res) => {
  try {
    const { id, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { phone },
      { new: true }
    );

    res.json({ success: true, phone: user.phone });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Update address
export const updateAddress = async (req, res) => {
  try {
    const { id, address } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { address },
      { new: true }
    );

    res.json({ success: true, address: user.address });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// ===================== UPDATE CITY =====================
export const updateCity = async (req, res) => {
  try {
    const { id, city } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { city },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      city: user.city,
    });
  } catch (error) {
    console.error("❌ Update city error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===================== UPDATE PROFILE IMAGE =====================

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId, // ✅ FIXED
      { profileImage: req.file.filename },
      { new: true }
    );

    res.status(200).json({
      success: true,
      image: user.profileImage,
    });
  } catch (error) {
    console.error("❌ Image upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};
