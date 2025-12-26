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
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};





// Update username
exports.updateName = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username: req.body.username },
      { new: true }
    );

    res.json({ success: true, username: user.username });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update phone
exports.updatePhone = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone: req.body.phone },
      { new: true }
    );

    res.json({ success: true, phone: user.phone });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { address: req.body.address },
      { new: true }
    );

    res.json({ success: true, address: user.address });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};