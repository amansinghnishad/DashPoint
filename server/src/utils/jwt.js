const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'dashpoint-development-access-secret-change-me';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || `${ACCESS_TOKEN_SECRET}_refresh_secret`;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const COOKIE_ACCESS_NAME = 'accessToken';
const COOKIE_REFRESH_NAME = 'refreshToken';
const JWT_ALGORITHM = 'HS256';

const assertJwtConfiguration = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be configured with at least 32 characters in production');
    }
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be configured with at least 32 characters in production');
    }
  }
};

// generateToken for short-lived access tokens (default 15m)
const generateToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: JWT_ALGORITHM
  });
};

// generateRefreshToken for long-lived refresh tokens (default 7d)
const generateRefreshToken = (payload) => {
  const tokenId = crypto.randomBytes(16).toString('hex');
  return jwt.sign({ ...payload, jti: tokenId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: JWT_ALGORITHM
  });
};

// verifyToken function
const verifyToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, { algorithms: [JWT_ALGORITHM] });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// verifyRefreshToken function
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, { algorithms: [JWT_ALGORITHM] });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// hash token with sha256 for safe DB storage
const hashToken = (token) => {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

// extractTokenFromHeader function
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

// Extract access token from header or cookie
const extractAccessToken = (req) => {
  const headerToken = extractTokenFromHeader(req.headers?.authorization);
  if (headerToken) return headerToken;

  if (req.cookies && req.cookies[COOKIE_ACCESS_NAME]) {
    return req.cookies[COOKIE_ACCESS_NAME];
  }

  return null;
};

// Extract refresh token from cookie, body, or custom header
const extractRefreshToken = (req) => {
  if (req.cookies && req.cookies[COOKIE_REFRESH_NAME]) {
    return req.cookies[COOKIE_REFRESH_NAME];
  }

  if (req.body && req.body.refreshToken) {
    return req.body.refreshToken;
  }

  if (req.headers && req.headers['x-refresh-token']) {
    return req.headers['x-refresh-token'];
  }

  return null;
};

const getCookieOptions = (maxAgeMs) => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {})
  };
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  if (accessToken) {
    res.cookie(COOKIE_ACCESS_NAME, accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
  }

  if (refreshToken) {
    res.cookie(COOKIE_REFRESH_NAME, refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days
  }
};

const clearAuthCookies = (res) => {
  const clearOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  };

  res.clearCookie(COOKIE_ACCESS_NAME, clearOptions);
  res.clearCookie(COOKIE_REFRESH_NAME, clearOptions);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  hashToken,
  extractTokenFromHeader,
  extractAccessToken,
  extractRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME,
  assertJwtConfiguration
};
