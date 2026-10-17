const User = require('../../../models/User');
const { getCalendarClient, normalizeEvent } = require('../services/googleCalendarService');

const listGoogleEvents = async (req, res, next) => {
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

const createGoogleEvent = async (req, res, next) => {
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

const deleteGoogleEvent = async (req, res, next) => {
  try {
    const eventId = String(req.params?.eventId || '').trim();
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'eventId is required'
      });
    }

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

    const { calendar } = getCalendarClient({
      accessToken: user.googleCalendar.accessToken,
      refreshToken: user.googleCalendar.refreshToken,
      tokenExpiryDate: user.googleCalendar.tokenExpiryDate
    });

    await calendar.events.delete({
      calendarId: user.googleCalendar.calendarId || 'primary',
      eventId
    });

    return res.status(200).json({
      success: true,
      message: 'Calendar item deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listGoogleEvents,
  createGoogleEvent,
  deleteGoogleEvent
};
