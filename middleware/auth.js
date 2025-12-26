import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("✅ RECEIVED TOKEN:", token);   // ✅ এখানে বসবে

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ DECODED TOKEN:", decoded); // ✅ এটা খুব useful

    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    req.userId = decoded.userId;

    next();
  } catch (err) {
    console.error("❌ JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
