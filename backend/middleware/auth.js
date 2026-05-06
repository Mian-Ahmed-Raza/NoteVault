const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Protect (Login Required) ──────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. Please login first.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Token invalid. User no longer exists.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        error: `Your account has been banned. Reason: ${user.banReason || 'Violated platform rules'}`,
        code: 'USER_BANNED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.', code: 'INVALID_TOKEN' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.', code: 'TOKEN_EXPIRED' });
    }
    next(error);
  }
};

// ─── Verified Only (Email Must Be Verified) ────────────────────────
const verifiedOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Please login first.',
      code: 'NO_TOKEN'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      error: 'Please verify your email address to access this feature.',
      code: 'EMAIL_NOT_VERIFIED',
      email: req.user.email
    });
  }

  next();
};

// ─── Optional Auth ─────────────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};

module.exports = { protect, verifiedOnly, optionalAuth };