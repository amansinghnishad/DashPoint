const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwt');

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  return new OAuth2Client(clientId);
};

const splitName = (fullName) => {
  const name = String(fullName || '').trim();
  if (!name) return { firstName: 'User', lastName: 'Account' };

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: 'Account' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

const normalizeUsernameBase = (value) => {
  const base = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base || 'user';
};

const generateUniqueUsername = async (preferredBase, email) => {
  const emailBase = String(email || '').split('@')[0];
  const base = normalizeUsernameBase(preferredBase || emailBase);

  const exists = async (candidate) => {
    const found = await User.findOne({ username: candidate }).select('_id');
    return Boolean(found);
  };

  let candidate = base.slice(0, 30);
  if (candidate.length < 3) candidate = `${candidate}___`.slice(0, 3);
  if (!(await exists(candidate))) return candidate;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = crypto.randomBytes(3).toString('hex');
    const trimmedBase = base.slice(0, Math.max(3, 30 - (suffix.length + 1)));
    const nextCandidate = `${trimmedBase}_${suffix}`.slice(0, 30);
    if (!(await exists(nextCandidate))) return nextCandidate;
  }

  // Fallback (very unlikely)
  return `${base.slice(0, 20)}_${Date.now().toString().slice(-6)}`.slice(0, 30);
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, name } = req.body;

    const normalizedEmail = String(email || '').toLowerCase().trim();
    const resolvedName = splitName(name);
    const resolvedFirstName = String(firstName || resolvedName.firstName).trim();
    const resolvedLastName = String(lastName || resolvedName.lastName).trim();
    const resolvedUsername = await generateUniqueUsername(username, normalizedEmail);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: resolvedUsername }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === normalizedEmail
          ? 'User with this email already exists'
          : 'Username is already taken'
      });
    }    // Create new user (password will be hashed in pre-save middleware)
    const user = new User({
      authProvider: 'local',
      username: resolvedUsername,
      email: normalizedEmail,
      password, // hashed in pre-save hook
      firstName: resolvedFirstName,
      lastName: resolvedLastName
    });
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Google login/signup using an ID token (credential)
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    const googleClient = getGoogleClient();
    if (!googleClient) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured on the server'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    const googleId = payload?.sub;
    const email = String(payload?.email || '').toLowerCase().trim();
    const emailVerified = Boolean(payload?.email_verified);
    const fullName = payload?.name;
    const picture = payload?.picture || null;
    const givenName = payload?.given_name;
    const familyName = payload?.family_name;

    if (!googleId || !email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google credential'
      });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const resolvedFirstName = String(givenName || splitName(fullName).firstName).trim();
      const resolvedLastName = String(familyName || splitName(fullName).lastName).trim();
      const resolvedUsername = await generateUniqueUsername(null, email);

      user = new User({
        authProvider: 'google',
        googleId,
        email,
        username: resolvedUsername,
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        avatar: picture,
        isEmailVerified: emailVerified,
        lastLogin: new Date()
      });
      await user.save();
    } else {
      // Link account if it exists with same email
      user.googleId = user.googleId || googleId;
      user.authProvider = 'google';
      if (!user.avatar && picture) user.avatar = picture;
      if (emailVerified) user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        user,
        token,
        isNewUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// User login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }    // Check password using model method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { firstName, lastName, username } = req.body;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(username && { username }),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Find user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // Note: For JWT, logout is typically handled client-side by removing the token
    // Here we can add token to a blacklist if needed in the future

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify token
exports.verifyToken = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: user
    });
  } catch (error) {
    next(error);
  }
};
