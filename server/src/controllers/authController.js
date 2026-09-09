const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  extractRefreshToken,
  setAuthCookies,
  clearAuthCookies
} = require('../utils/jwt');

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

const saveUserRefreshToken = async (user, rawRefreshToken, req) => {
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  const userAgent = String(req.headers['user-agent'] || '').slice(0, 300);
  const ip = String(req.ip || req.connection?.remoteAddress || '').slice(0, 60);

  const activeTokens = (user.refreshTokens || []).filter(
    (t) => t.expiresAt && new Date(t.expiresAt) > new Date()
  );

  user.refreshTokens = [
    ...activeTokens.slice(-9),
    {
      tokenHash,
      expiresAt,
      createdAt: new Date(),
      userAgent,
      ip
    }
  ];

  await user.save();
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
    }

    // Create new user (password will be hashed in pre-save middleware)
    const user = new User({
      authProvider: 'local',
      username: resolvedUsername,
      email: normalizedEmail,
      password,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      lastLogin: new Date()
    });
    await user.save();

    // Generate JWT Access & Refresh token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString()
    });

    await saveUserRefreshToken(user, refreshToken, req);
    setAuthCookies(res, { accessToken: token, refreshToken });

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
    const refreshToken = generateRefreshToken({
      userId: user._id.toString()
    });

    await saveUserRefreshToken(user, refreshToken, req);
    setAuthCookies(res, { accessToken: token, refreshToken });

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
    }

    // Check if account is temporarily locked
    if (user.isLocked()) {
      const lockMinutesRemaining = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to excessive failed attempts. Please try again in ${Math.max(1, lockMinutesRemaining)} minute(s).`
      });
    }

    // Check password using model method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      const updatedUser = await User.findById(user._id);
      if (updatedUser.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to excessive failed attempts. Please try again in 15 minutes.'
        });
      }

      const attemptsLeft = Math.max(0, 5 - (updatedUser.failedLoginAttempts || 0));
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${attemptsLeft > 0 ? `${attemptsLeft} attempt(s) remaining before lockout.` : ''}`
      });
    }

    // Reset login attempts on success
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT Access & Refresh token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString()
    });

    await saveUserRefreshToken(user, refreshToken, req);
    setAuthCookies(res, { accessToken: token, refreshToken });

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

// Refresh access token
exports.refreshToken = async (req, res, next) => {
  try {
    const rawRefreshToken = extractRefreshToken(req);

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (error) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Find the token in user's refreshTokens
    const matchingTokenIndex = (user.refreshTokens || []).findIndex(
      (t) => t.tokenHash === tokenHash && t.expiresAt && new Date(t.expiresAt) > new Date()
    );

    if (matchingTokenIndex === -1) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired or already been revoked'
      });
    }

    // Token rotation: remove used token and issue new token pair
    user.refreshTokens.splice(matchingTokenIndex, 1);

    const newAccessToken = generateToken({
      userId: user._id.toString(),
      email: user.email
    });
    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString()
    });

    await saveUserRefreshToken(user, newRefreshToken, req);
    setAuthCookies(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user,
        token: newAccessToken
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

    // Update password and invalidate all existing refresh sessions for security
    user.password = hashedNewPassword;
    user.refreshTokens = [];
    user.updatedAt = new Date();
    await user.save();

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    const rawRefreshToken = extractRefreshToken(req);
    const userId = req.user?._id;

    if (userId) {
      const user = await User.findById(userId);
      if (user && rawRefreshToken) {
        const tokenHash = hashToken(rawRefreshToken);
        user.refreshTokens = (user.refreshTokens || []).filter((t) => t.tokenHash !== tokenHash);
        await user.save();
      }
    }

    clearAuthCookies(res);

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
