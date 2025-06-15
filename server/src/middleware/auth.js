const User = require('../models/User');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

// authenticateToken middleware
const auth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      console.log('No token found in request headers');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    console.log('Token found:', token.substring(0, 20) + '...');
    const decoded = verifyToken(token);
    console.log('Token decoded successfully:', decoded);

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      console.log('User not found or inactive:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    console.log('User authenticated successfully:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// requireRole middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// optionalAuth middleware (for endpoints that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = auth;
