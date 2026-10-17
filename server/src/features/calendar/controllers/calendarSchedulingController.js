const { validationResult } = require('express-validator');
const User = require('../../../models/User');
const { getCalendarClient, normalizeEvent, queryFreeBusy } = require('../services/googleCalendarService');
const { planSchedule } = require('../services/calendarScheduler');

const queryGoogleFreeBusy = async (req, res, next) => {
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

const scheduleGoogleBlock = async (req, res, next) => {
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

module.exports = {
  queryGoogleFreeBusy,
  scheduleGoogleBlock
};
