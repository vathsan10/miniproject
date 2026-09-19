import { verifyToken } from "../lib/jwt.js";

export const COOKIE_NAME = "unipay_token";

// Frontend route guards are UX only - this is the actual security boundary.
// Every protected route must go through requireAuth (and requireRole where
// applicable); never trust a role claim from the request body or query.
export function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ error: "Session expired, please log in again" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have access to this resource" });
    }
    next();
  };
}
