import express from "express";
import Message from "../models/Message.js";
import protect from "../middleware/auth.js";
import { isAdmin, isModeratorOrAdmin } from "../middleware/role.js";

const router = express.Router();

/* ======================
   📩 SAVE MESSAGE (PUBLIC)
====================== */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        message: "Name, email, phone and message are required"
      });
    }

    const newMsg = await Message.create({
      name,
      email,
      phone,
      message
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: newMsg
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   📥 GET ALL MESSAGES
   Admin + Moderator
====================== */
router.get("/", protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   🔢 GET UNREAD COUNT
   Admin + Moderator
====================== */
router.get("/count", protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const count = await Message.countDocuments({ isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   👁️ MARK AS READ
   Admin + Moderator
====================== */
router.put("/:id/read", protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    msg.isRead = true;
    await msg.save();

    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   🗑️ DELETE MESSAGE
   Admin ONLY
====================== */
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.deleteOne();
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
