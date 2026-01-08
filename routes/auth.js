import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import { sendResetEmail } from "../utils/email.js";

const router = express.Router();

/* ============================================================
  SIGNUP
============================================================ */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
  LOGIN
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

  const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,   // ✅ এটা দরকার admin panel এর জন্য
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,      // ✅ ADD THIS
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
  UPDATE PROFILE IMAGE
============================================================ */

import upload from "../middleware/profileUpload.js";
import { updateProfileImage } from "../controllers/authController.js";
import protect from "../middleware/auth.js";

router.put(
  "/update-profile-image",
  protect,
  upload.single("image"),
  updateProfileImage
);


/* ============================================================
  UPDATE NAME
============================================================ */
router.put("/update-name", async (req, res) => {
  try {
    const { id, name } = req.body;

    const user = await User.findByIdAndUpdate(id, { name }, { new: true });

    res.json({
      success: true,
      message: "Name updated",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
  UPDATE PHONE
============================================================ */
router.put("/update-phone", async (req, res) => {
  try {
    const { id, phone } = req.body;

    const user = await User.findByIdAndUpdate(id, { phone }, { new: true });

    res.json({
      success: true,
      message: "Phone updated",
      phone: user.phone,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
  UPDATE ADDRESS
============================================================ */
router.put("/update-address", async (req, res) => {
  try {
    const { id, address } = req.body;

    const user = await User.findByIdAndUpdate(id, { address }, { new: true });

    res.json({
      success: true,
      message: "Address updated",
      address: user.address,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ============================================================
  UPDATE CITY
============================================================ */
router.put("/update-city", async (req, res) => {
  try {
    const { id, city } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { city },
      { new: true }
    );

    res.json({
      success: true,
      message: "City updated",
      city: user.city,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




import authMiddleware from "../middleware/auth.js";

/* ============================================================
  RESET PASSWORD (Profile → Current + New Pass)
============================================================ */
router.post("/reset-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});





/* ============================================================
  FORGOT PASSWORD (Send Reset Email)
============================================================ */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account found with this email" });

    // 1) Token Generate
    const token = crypto.randomBytes(32).toString("hex");

    // Save token in DB + expiry 15 min
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    // 2) Reset URL
    const resetURL = `${process.env.FRONTEND_URL}/Account/reset-password.html?token=${token}`;

    // 3) Send Email
    await sendResetEmail({
      to: user.email,
      subject: "Reset Your KI-VAN Password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}" 
          style="padding:10px 20px;background:#ff523b;color:white;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
        <br><br>
        <p>This link will expire in 15 minutes.</p>
      `
    });

    return res.json({ message: "Reset link sent to your email" });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});




/* ============================================================
  RESET PASSWORD USING TOKEN
============================================================ */
router.post("/reset-password-token", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res.status(400).json({ message: "Invalid request" });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return res.json({ message: "Password reset successfully" });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});




// ✅ এইটা নতুন add করবে
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


/* ============================================================
  EXPORT ROUTER (MUST BE LAST)
============================================================ */
export default router;
