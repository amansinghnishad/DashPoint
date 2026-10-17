const User = require('../../../../models/User');
const { getCalendarClient, normalizeEvent } = require('../../../calendar/services/googleCalendarService');
const { buildResult } = require('../searchResultUtils');

const DEFAULT_CALENDAR_LOOKBACK_DAYS = 90;
const DEFAULT_CALENDAR_LOOKAHEAD_DAYS = 180;

const searchCalendarEvents = async ({ userId, query, limit }) => {
  let user;
  try {
    user = await User.findById(userId).select(
      '+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId'
    );
  } catch (error) {
    return {
      results: [],
      warning: error.message
    };
  }

  if (!user?.googleCalendar?.connected || !user?.googleCalendar?.refreshToken) {
    return {
      results: [],
      warning: 'Google Calendar is not connected'
    };
  }

  try {
    const { calendar } = getCalendarClient({
      accessToken: user.googleCalendar.accessToken,
      refreshToken: user.googleCalendar.refreshToken,
      tokenExpiryDate: user.googleCalendar.tokenExpiryDate
    });

    const now = Date.now();
    const timeMin = new Date(now - DEFAULT_CALENDAR_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const timeMax = new Date(now + DEFAULT_CALENDAR_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);
    const calendarId = user.googleCalendar.calendarId || 'primary';

    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
      q: query
    });

    const normalized = (response?.data?.items || []).map(normalizeEvent).slice(0, limit);

    return {
      results: normalized.map((event) =>
        buildResult({
          type: 'calendar_event',
          id: event.id,
          title: event.summary,
          subtitle: event.start || 'Calendar event',
          snippet: [event.description, event.location].filter(Boolean).join(' '),
          url: event.htmlLink,
          metadata: {
            eventId: event.id,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            status: event.status
          }
        })
      ),
      warning: ''
    };
  } catch (error) {
    console.warn('[ChatSearch] Calendar search failed:', error.message);
    return {
      results: [],
      warning: 'Google Calendar search is temporarily unavailable'
    };
  }
};

module.exports = {
  searchCalendarEvents
};
