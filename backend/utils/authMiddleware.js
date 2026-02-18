// backend/utils/authMiddleware.js
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

module.exports = { requireAuth };
