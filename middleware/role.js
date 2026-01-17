// server/middleware/role.js

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const isModeratorOrAdmin = (req, res, next) => {
  if (!["admin", "moderator"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Admin or Moderator access only",
    });
  }
  next();
};

const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
    next();
  };
};

export default role; // ✅ MUST
