import User from "../models/user.js"

;
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied (Admin only)" });
  }
  next();
};

export default isAdmin;
