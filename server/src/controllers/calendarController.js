const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const {
  buildAuthUrl,
  exchangeCodeForTokens,
  getCalendarClient,
  normalizeEvent,
  queryFreeBusy
} = require('../services/googleCalendarService');

const { planSchedule } = require('../services/calendarScheduler');

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

exports.getGoogleStatus = async (req, res, next) => {
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

exports.getGoogleAuthUrl = async (req, res, next) => {
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

exports.handleGoogleCallback = async (req, res, next) => {
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

exports.disconnectGoogleCalendar = async (req, res, next) => {
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

exports.listGoogleEvents = async (req, res, next) => {
  try {
    const timeMinRaw = req.query.timeMin;
    const timeMaxRaw = req.query.timeMax;

    const timeMin = timeMinRaw ? new Date(String(timeMinRaw)) : new Date();
    const timeMax = timeMaxRaw
      ? new Date(String(timeMaxRaw))
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(timeMin.getTime()) || Number.isNaN(timeMax.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timeMin/timeMax'
      });
    }

    const user = await User.findById(req.user._id).select('+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.googleCalendar?.connected || !user.googleCalendar?.refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Google Calendar is not connected'
      });
    }

    const { calendar } = getCalendarClient({
      accessToken: user.googleCalendar.accessToken,
      refreshToken: user.googleCalendar.refreshToken,
      tokenExpiryDate: user.googleCalendar.tokenExpiryDate
    });

    const calendarId = user.googleCalendar.calendarId || 'primary';
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500
    });

    const events = (response.data.items || []).map(normalizeEvent);

    res.status(200).json({
      success: true,
      data: {
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        events
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createGoogleEvent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      '+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId'
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.googleCalendar?.connected || !user.googleCalendar?.refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Google Calendar is not connected'
      });
    }

    const summary = String(req.body?.summary || req.body?.title || '').trim();
    const description =
      req.body?.description !== undefined ? String(req.body.description) : undefined;
    const dashpointType = String(req.body?.dashpointType || req.body?.type || 'event')
      .trim()
      .toLowerCase();
    const dashpointColorRaw =
      req.body?.dashpointColor !== undefined && req.body?.dashpointColor !== null
        ? String(req.body.dashpointColor).trim().toLowerCase()
        : null;

    const allowedColors = new Set(['info', 'success', 'warning', 'danger']);
    const dashpointColor =
      dashpointColorRaw && allowedColors.has(dashpointColorRaw)
        ? dashpointColorRaw
        : null;

    if (!summary) {
      return res.status(400).json({
        success: false,
        message: 'summary is required'
      });
    }

    const start = req.body?.start;
    const end = req.body?.end;

    if (!start || typeof start !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'start is required'
      });
    }

    const calendarId = user.googleCalendar.calendarId || 'primary';
    const { calendar } = getCalendarClient({
      accessToken: user.googleCalendar.accessToken,
      refreshToken: user.googleCalendar.refreshToken,
      tokenExpiryDate: user.googleCalendar.tokenExpiryDate
    });

    const eventResource = {
      summary,
      ...(description !== undefined ? { description } : null),
      start: {},
      end: {},
      extendedProperties: {
        private: {
          dashpointType,
          ...(dashpointColor ? { dashpointColor } : null)
        }
      }
    };

    // All-day event: { start: { date: 'YYYY-MM-DD' } }
    if (start.date) {
      const date = String(start.date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start.date format (expected YYYY-MM-DD)'
        });
      }

      eventResource.start.date = date;

      const endDate = end?.date ? String(end.date) : null;
      if (endDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end.date format (expected YYYY-MM-DD)'
          });
        }
        eventResource.end.date = endDate;
      } else {
        // Google requires end.date to be the day AFTER start.date for all-day events.
        const d = new Date(`${date}T00:00:00`);
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        eventResource.end.date = `${yyyy}-${mm}-${dd}`;
      }
    } else if (start.dateTime) {
      const startDateTime = new Date(String(start.dateTime));
      if (Number.isNaN(startDateTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start.dateTime'
        });
      }

      let endDateTime;
      if (end?.dateTime) {
        endDateTime = new Date(String(end.dateTime));
        if (Number.isNaN(endDateTime.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end.dateTime'
          });
        }
      } else {
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      }

      if (endDateTime.getTime() <= startDateTime.getTime()) {
        return res.status(400).json({
          success: false,
          message: 'end must be after start'
        });
      }

      eventResource.start.dateTime = startDateTime.toISOString();
      eventResource.end.dateTime = endDateTime.toISOString();
    } else {
      return res.status(400).json({
        success: false,
        message: 'start must include either date or dateTime'
      });
    }

    // Optional: allow client to provide Google Calendar colorId (1-11).
    if (req.body?.colorId) {
      eventResource.colorId = String(req.body.colorId);
    }

    const created = await calendar.events.insert({
      calendarId,
      requestBody: eventResource
    });

    res.status(201).json({
      success: true,
      data: normalizeEvent(created.data),
      message: 'Event created'
    });
  } catch (error) {
    next(error);
  }
};

exports.queryGoogleFreeBusy = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const timeMin = new Date(String(req.body.timeMin));
    const timeMax = new Date(String(req.body.timeMax));
    if (Number.isNaN(timeMin.getTime()) || Number.isNaN(timeMax.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid timeMin/timeMax' });
    }
    if (timeMax.getTime() <= timeMin.getTime()) {
      return res.status(400).json({ success: false, message: 'timeMax must be after timeMin' });
    }

    // Bound request windows to prevent accidental huge queries.
    const maxRangeMs = 31 * 24 * 60 * 60 * 1000;
    if (timeMax.getTime() - timeMin.getTime() > maxRangeMs) {
      return res.status(400).json({
        success: false,
        message: 'Requested range too large (max 31 days)'
      });
    }

    const user = await User.findById(req.user._id).select(
      '+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.googleCalendar?.connected || !user.googleCalendar?.refreshToken) {
      return res.status(400).json({ success: false, message: 'Google Calendar is not connected' });
    }

    const calendarIds = Array.isArray(req.body.calendarIds) && req.body.calendarIds.length
      ? req.body.calendarIds
      : [user.googleCalendar.calendarId || 'primary'];

    const timezone = req.body.timezone ? String(req.body.timezone) : undefined;

    const { calendar } = getCalendarClient({
      accessToken: user.googleCalendar.accessToken,
      refreshToken: user.googleCalendar.refreshToken,
      tokenExpiryDate: user.googleCalendar.tokenExpiryDate
    });

    const fb = await queryFreeBusy({
      calendar,
      timeMin,
      timeMax,
      calendarIds,
      timeZone: timezone
    });

    const calendars = fb?.calendars || {};
    const busy = Object.values(calendars)
      .flatMap((c) => (Array.isArray(c?.busy) ? c.busy : []))
      .map((b) => ({ start: b.start, end: b.end }));

    res.status(200).json({
      success: true,
      data: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        calendarIds,
        busy
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.scheduleGoogleBlock = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const title = String(req.body.summary || req.body.title || 'Practice').trim();
    const description =
      req.body.description !== undefined ? String(req.body.description) : undefined;

    const timeMin = new Date(String(req.body.timeMin));
    const timeMax = new Date(String(req.body.timeMax));
    if (Number.isNaN(timeMin.getTime()) || Number.isNaN(timeMax.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid timeMin/timeMax' });
    }
    if (timeMax.getTime() <= timeMin.getTime()) {
      return res.status(400).json({ success: false, message: 'timeMax must be after timeMin' });
    }

    const durationMinutes = parseInt(req.body.durationMinutes, 10);
    const conflictStrategy = String(req.body.conflictStrategy || 'auto');
    const minSessionMinutes = req.body.minSessionMinutes !== undefined ? parseInt(req.body.minSessionMinutes, 10) : undefined;
    const maxSplitParts = req.body.maxSplitParts !== undefined ? parseInt(req.body.maxSplitParts, 10) : undefined;
    const allowLightPractice = req.body.allowLightPractice !== undefined ? Boolean(req.body.allowLightPractice) : true;
    const searchDays = req.body.searchDays !== undefined ? parseInt(req.body.searchDays, 10) : undefined;
    const timezone = req.body.timezone ? String(req.body.timezone) : undefined;

    const createEvents = req.body.createEvents !== undefined ? Boolean(req.body.createEvents) : true;

    const allowedColors = new Set(['info', 'success', 'warning', 'danger']);
    const dashpointColorRaw =
      req.body?.dashpointColor !== undefined && req.body?.dashpointColor !== null
        ? String(req.body.dashpointColor).trim().toLowerCase()
        : null;
    const dashpointColor = dashpointColorRaw && allowedColors.has(dashpointColorRaw)
      ? dashpointColorRaw
      : null;
    const dashpointType = String(req.body?.dashpointType || 'skill-practice').trim().toLowerCase();

    // Optional: allow client to provide Google Calendar colorId (1-11).
    // If not provided, derive from dashpointColor.
    let colorId = null;
    if (req.body?.colorId !== undefined && req.body?.colorId !== null) {
      const raw = String(req.body.colorId).trim();
      if (/^\d+$/.test(raw)) {
        const n = parseInt(raw, 10);
        if (n >= 1 && n <= 11) colorId = String(n);
      }
    }
    if (!colorId && dashpointColor) {
      const dashpointToGoogle = {
        info: '9',
        success: '10',
        warning: '5',
        danger: '11'
      };
      colorId = dashpointToGoogle[dashpointColor] || null;
    }

    const user = await User.findById(req.user._id).select(
      '+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.googleCalendar?.connected || !user.googleCalendar?.refreshToken) {
      return res.status(400).json({ success: false, message: 'Google Calendar is not connected' });
    }

    const calendarId = req.body.calendarId ? String(req.body.calendarId) : (user.googleCalendar.calendarId || 'primary');
    const { calendar } = getCalendarClient({
      accessToken: user.googleCalendar.accessToken,
      refreshToken: user.googleCalendar.refreshToken,
      tokenExpiryDate: user.googleCalendar.tokenExpiryDate
    });

    // Use free/busy as the authoritative "commitments" list.
    const fb = await queryFreeBusy({
      calendar,
      timeMin,
      timeMax,
      calendarIds: [calendarId],
      timeZone: timezone
    });

    const busy = (fb?.calendars?.[calendarId]?.busy || []).map((b) => ({
      start: b.start,
      end: b.end
    }));

    const plan = planSchedule({
      title,
      durationMinutes,
      windowStart: timeMin,
      windowEnd: timeMax,
      busy,
      conflictStrategy,
      minSessionMinutes,
      maxSplitParts,
      allowLightPractice,
      searchDays
    });

    const sessions = Array.isArray(plan.sessions) ? plan.sessions : [];

    if (!createEvents) {
      return res.status(200).json({
        success: true,
        data: {
          calendarId,
          ...plan,
          sessions: sessions.map((s) => ({
            start: s.start instanceof Date ? s.start.toISOString() : new Date(s.start).toISOString(),
            end: s.end instanceof Date ? s.end.toISOString() : new Date(s.end).toISOString(),
            lightPractice: Boolean(s.lightPractice),
            summary: `${plan.title}${s.summarySuffix ? ` (${s.summarySuffix})` : ''}`
          }))
        }
      });
    }

    const createdEvents = [];
    for (const s of sessions) {
      const start = s.start instanceof Date ? s.start : new Date(s.start);
      const end = s.end instanceof Date ? s.end : new Date(s.end);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;

      const summary = `${plan.title}${s.summarySuffix ? ` (${s.summarySuffix})` : ''}`;
      const eventResource = {
        summary,
        ...(description !== undefined ? { description } : null),
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        ...(colorId ? { colorId } : null),
        extendedProperties: {
          private: {
            dashpointType,
            ...(dashpointColor ? { dashpointColor } : null),
            ...(s.lightPractice ? { dashpointIntensity: 'light' } : null)
          }
        }
      };

      const created = await calendar.events.insert({
        calendarId,
        requestBody: eventResource
      });

      createdEvents.push({
        session: {
          start: start.toISOString(),
          end: end.toISOString(),
          lightPractice: Boolean(s.lightPractice)
        },
        event: normalizeEvent(created.data)
      });
    }

    res.status(201).json({
      success: true,
      data: {
        calendarId,
        ...plan,
        createdEvents
      },
      message: createdEvents.length ? 'Scheduled event(s) created' : 'No events created'
    });
  } catch (error) {
    next(error);
  }
};

