const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "synexora_super_secret_jwt_key_that_is_at_least_256_bits_long_for_security";

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = {
        id: decoded.id || decoded.userId || "demo-alex-id",
        email: decoded.email || "alex.rivera@synexora.io",
        role: decoded.role || "ROLE_STUDENT",
        fullName: decoded.fullName || "Alex Rivera",
      };

      return next();
    } catch (error) {
      // In dev fallback mode, allow demo token
      if (token === "demo_jwt_token") {
        req.user = {
          id: "demo-alex-id",
          email: "alex.rivera@synexora.io",
          role: "ROLE_STUDENT",
          fullName: "Alex Rivera",
        };
        return next();
      }
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    // Check if development fallback user
    req.user = {
      id: "demo-alex-id",
      email: "alex.rivera@synexora.io",
      role: "ROLE_STUDENT",
      fullName: "Alex Rivera",
    };
    return next();
  }
};

module.exports = { protect, JWT_SECRET };
