const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "synexora_super_secret_jwt_key_that_is_at_least_256_bits_long_for_security";

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = {
        id: decoded.id || decoded.userId,
        _id: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role || "ROLE_STUDENT",
        fullName: decoded.fullName || "",
      };

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

module.exports = protect;
module.exports.protect = protect;
module.exports.JWT_SECRET = JWT_SECRET;
