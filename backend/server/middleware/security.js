// Security Hardening Middleware for Synexora API Server

// In-memory rate limiting map
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requests per minute per IP

/**
 * Security Headers Middleware: Enforces modern HTTP security policies
 */
function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking via iframes
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // Strict Transport Security (HSTS)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // Cross-Site Scripting (XSS) Filter Protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions Policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  next();
}

/**
 * Rate Limiter Middleware: Throttles excessive requests per IP
 */
function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || "127.0.0.1";
  const now = Date.now();

  let clientData = ipRequestCounts.get(ip);
  if (!clientData || now - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
    clientData = { startTime: now, count: 1 };
    ipRequestCounts.set(ip, clientData);
  } else {
    clientData.count++;
    if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: "API rate limit exceeded. Please retry in 60 seconds.",
        retryAfter: Math.ceil((clientData.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000),
      });
    }
  }

  // Periodic cleanup of stale IPs every 5 minutes
  if (ipRequestCounts.size > 10000) {
    for (const [key, data] of ipRequestCounts.entries()) {
      if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
        ipRequestCounts.delete(key);
      }
    }
  }

  next();
}

/**
 * Request Sanitization: Strips MongoDB query injection keys ($where, $gt, etc.)
 */
function sanitizeRequest(req, res, next) {
  function sanitize(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
    return obj;
  }

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
}

module.exports = {
  securityHeaders,
  rateLimiter,
  sanitizeRequest,
};
