const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation
} = require('../middleware/validators/authValidators');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // 50 requests for dev, 5 for production
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/google', authLimiter, authController.googleAuth);
router.post('/logout', auth, authController.logout);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, updateProfileValidation, authController.updateProfile);
router.put('/password', auth, changePasswordValidation, authController.changePassword);
router.get('/verify', auth, authController.verifyToken);

module.exports = router;
