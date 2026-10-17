const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const { buildAuthUrl, exchangeCodeForTokens } = require('../services/googleCalendarService');

const getClientSuccessRedirect = () => {
  return (
    process.env.GOOGLE_OAUTH_SUCCESS_REDIRECT ||
    process.env.CLIENT_URL ||
    'http://localhost:5173'
  );
};

const signOAuthState = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10m' });
};

const verifyOAuthState = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

const getGoogleStatus = async (req, res, next) => {
  try {
    // req.user is populated by auth middleware, but does not include select:false fields.
    const user = await User.findById(req.user._id).select('googleCalendar.connected googleCalendar.calendarId');
    const connected = Boolean(user?.googleCalendar?.connected);

    res.status(200).json({
      success: true,
      data: {
        connected,
        calendarId: user?.googleCalendar?.calendarId || 'primary'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getGoogleAuthUrl = async (req, res, next) => {
  try {
    const clientRedirect = getClientSuccessRedirect();

    // Optionally allow the client to tell us where to land after connect.
    const redirectPath = String(req.query.redirect || '').trim();
    const safeRedirect = redirectPath.startsWith('/') ? redirectPath : '/dashboard';

    const state = signOAuthState({
      userId: req.user._id.toString(),
      redirect: safeRedirect,
      t: Date.now()
    });

    const url = buildAuthUrl({ state });
    res.status(200).json({
      success: true,
      data: {
        url,
        clientRedirectBase: clientRedirect
      }
    });
  } catch (error) {
    next(error);
  }
};

const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;
    const clientBase = getClientSuccessRedirect();

    if (error) {
      return res.redirect(`${clientBase}/dashboard?googleCalendar=error`);
    }

    if (!code || !state) {
      return res.redirect(`${clientBase}/dashboard?googleCalendar=missing_params`);
    }

    let decoded;
    try {
      decoded = verifyOAuthState(String(state));
    } catch (e) {
      return res.redirect(`${clientBase}/dashboard?googleCalendar=invalid_state`);
    }

    const userId = decoded?.userId;
    const redirectPath = decoded?.redirect && String(decoded.redirect).startsWith('/')
      ? String(decoded.redirect)
      : '/dashboard';

    if (!userId) {
      return res.redirect(`${clientBase}${redirectPath}?googleCalendar=invalid_state`);
    }

    const tokens = await exchangeCodeForTokens(String(code));
    const accessToken = tokens.access_token || null;
    const refreshToken = tokens.refresh_token || null;
    const scope = tokens.scope || null;
    const expiryDate = tokens.expiry_date || null;

    const user = await User.findById(userId).select('+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.scope +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId');
    if (!user) {
      return res.redirect(`${clientBase}${redirectPath}?googleCalendar=user_not_found`);
    }

    const existingRefresh = user.googleCalendar?.refreshToken;

    user.googleCalendar = {
      ...(user.googleCalendar || {}),
      connected: true,
      calendarId: user.googleCalendar?.calendarId || 'primary',
      accessToken,
      refreshToken: refreshToken || existingRefresh || null,
      scope,
      tokenExpiryDate: expiryDate
    };

    await user.save();

    return res.redirect(`${clientBase}${redirectPath}?googleCalendar=connected`);
  } catch (error) {
    next(error);
  }
};

const disconnectGoogleCalendar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.scope +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.googleCalendar = {
      connected: false,
      calendarId: user.googleCalendar?.calendarId || 'primary',
      accessToken: null,
      refreshToken: null,
      scope: null,
      tokenExpiryDate: null
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google Calendar disconnected'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoogleStatus,
  getGoogleAuthUrl,
  handleGoogleCallback,
  disconnectGoogleCalendar
};
