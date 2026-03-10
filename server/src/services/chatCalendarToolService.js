const jwt = require('jsonwebtoken');

const User = require('../models/User');
const {
  buildAuthUrl,
  getCalendarClient,
  normalizeEvent,
  queryFreeBusy
} = require('./googleCalendarService');
const { planSchedule } = require('./calendarScheduler');

const GOOGLE_CALENDAR_SELECT =
  '+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId';

const DASHPOINT_TO_GOOGLE_COLOR_ID = Object.freeze({
  info: '9',
  success: '10',
  warning: '5',
  danger: '11'
});

const ALLOWED_DASHPOINT_COLORS = new Set(Object.keys(DASHPOINT_TO_GOOGLE_COLOR_ID));
const ALLOWED_CONFLICT_STRATEGIES = new Set(['auto', 'split', 'shorten', 'next-window']);

const toUserObjectIdString = (userId) => String(userId || '').trim();

const toSafeRedirectPath = (value) => {
  const raw = String(value || '/dashboard').trim();
  return raw.startsWith('/') ? raw : '/dashboard';
};

const requireJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
};

const signOAuthState = (payload) => {
  requireJwtSecret();
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10m' });
};

const requireConnectedCalendar = (user) => {
  if (!user?.googleCalendar?.connected || !user?.googleCalendar?.refreshToken) {
    throw new Error(
      'Google Calendar is not connected. Use getGoogleCalendarAuthUrl to connect first.'
    );
  }
};

const parseDateTime = (value, fieldName) => {
  const date = new Date(String(value || '').trim());
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}. Use ISO datetime format.`);
  }
  return date;
};

const parseDateOnly = (value, fieldName) => {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error(`Invalid ${fieldName}. Use YYYY-MM-DD.`);
  }
  return raw;
};

const toClampedInt = (value, { min, max, fallback }) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
};

const normalizeDashpointColor = (value) => {
  const raw = String(value || '')
    .trim()
    .toLowerCase();
  if (!raw) return null;
  return ALLOWED_DASHPOINT_COLORS.has(raw) ? raw : null;
};

const normalizeGoogleColorId = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 11) {
    throw new Error('colorId must be an integer between 1 and 11');
  }

  return String(parsed);
};

const resolveColorId = ({ colorId, dashpointColor }) => {
  const explicitColorId = normalizeGoogleColorId(colorId);
  if (explicitColorId) {
    return explicitColorId;
  }

  const normalizedDashpointColor = normalizeDashpointColor(dashpointColor);
  if (!normalizedDashpointColor) {
    return null;
  }

  return DASHPOINT_TO_GOOGLE_COLOR_ID[normalizedDashpointColor] || null;
};

const buildConnectionResult = ({ userId, redirectPath }) => {
  const state = signOAuthState({
    userId,
    redirect: redirectPath,
    t: Date.now()
  });

  const url = buildAuthUrl({ state });
  return {
    url,
    redirectPath,
    message: 'Open this URL to connect Google Calendar.'
  };
};

const loadUserWithCalendar = async (userId) => {
  const user = await User.findById(toUserObjectIdString(userId)).select(
    GOOGLE_CALENDAR_SELECT
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const parseTimeWindow = ({ timeMin, timeMax, defaultDays = 14 }) => {
  const resolvedTimeMin = timeMin ? parseDateTime(timeMin, 'timeMin') : new Date();
  const resolvedTimeMax = timeMax
    ? parseDateTime(timeMax, 'timeMax')
    : new Date(resolvedTimeMin.getTime() + defaultDays * 24 * 60 * 60 * 1000);

  if (resolvedTimeMax.getTime() <= resolvedTimeMin.getTime()) {
    throw new Error('timeMax must be after timeMin');
  }

  return {
    timeMin: resolvedTimeMin,
    timeMax: resolvedTimeMax
  };
};

const createEventPayloadFromArgs = (args = {}) => {
  const summary = String(args?.summary || args?.title || '').trim();
  if (!summary) {
    throw new Error('summary is required');
  }

  const description =
    args?.description !== undefined ? String(args.description) : undefined;
  const dashpointType = String(args?.dashpointType || 'event').trim().toLowerCase();
  const dashpointColor = normalizeDashpointColor(args?.dashpointColor);
  const colorId = resolveColorId({
    colorId: args?.colorId,
    dashpointColor
  });

  const eventResource = {
    summary,
    ...(description !== undefined ? { description } : null),
    start: {},
    end: {},
    ...(colorId ? { colorId } : null),
    extendedProperties: {
      private: {
        dashpointType,
        ...(dashpointColor ? { dashpointColor } : null)
      }
    }
  };

  const startDate = args?.date || args?.start?.date;
  const endDate = args?.endDate || args?.end?.date;
  const startDateTime = args?.startDateTime || args?.start?.dateTime;
  const endDateTime = args?.endDateTime || args?.end?.dateTime;

  if (startDate) {
    const normalizedStartDate = parseDateOnly(startDate, 'date');
    eventResource.start.date = normalizedStartDate;

    if (endDate) {
      eventResource.end.date = parseDateOnly(endDate, 'endDate');
    } else {
      const nextDay = new Date(`${normalizedStartDate}T00:00:00.000Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      const yyyy = nextDay.getUTCFullYear();
      const mm = String(nextDay.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(nextDay.getUTCDate()).padStart(2, '0');
      eventResource.end.date = `${yyyy}-${mm}-${dd}`;
    }

    return eventResource;
  }

  if (!startDateTime) {
    throw new Error('Provide either date (all-day) or startDateTime');
  }

  const start = parseDateTime(startDateTime, 'startDateTime');
  const end = endDateTime
    ? parseDateTime(endDateTime, 'endDateTime')
    : new Date(start.getTime() + 60 * 60 * 1000);

  if (end.getTime() <= start.getTime()) {
    throw new Error('endDateTime must be after startDateTime');
  }

  eventResource.start.dateTime = start.toISOString();
  eventResource.end.dateTime = end.toISOString();
  return eventResource;
};

const normalizeSessionsForResponse = (sessions = [], planTitle = '') =>
  sessions.map((session) => {
    const start =
      session?.start instanceof Date
        ? session.start
        : new Date(String(session?.start || ''));
    const end =
      session?.end instanceof Date ? session.end : new Date(String(session?.end || ''));

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      lightPractice: Boolean(session?.lightPractice),
      summary: `${planTitle}${session?.summarySuffix ? ` (${session.summarySuffix})` : ''}`
    };
  });

const getGoogleCalendarStatusTool = async (userId, args = {}) => {
  const user = await loadUserWithCalendar(userId);
  const connected = Boolean(user?.googleCalendar?.connected);
  const calendarId = String(user?.googleCalendar?.calendarId || 'primary');
  const includeAuthUrl = Boolean(args?.includeAuthUrl);

  const response = {
    connected,
    calendarId
  };

  if (!connected && includeAuthUrl) {
    response.connection = buildConnectionResult({
      userId: String(user._id),
      redirectPath: toSafeRedirectPath(args?.redirectPath)
    });
  }

  return response;
};

const getGoogleCalendarAuthUrlTool = async (userId, args = {}) => {
  const user = await User.findById(toUserObjectIdString(userId)).select('_id');
  if (!user) {
    throw new Error('User not found');
  }

  const redirectPath = toSafeRedirectPath(args?.redirectPath);

  return buildConnectionResult({
    userId: String(user._id),
    redirectPath
  });
};

const listGoogleCalendarEventsTool = async (userId, args = {}) => {
  const user = await loadUserWithCalendar(userId);
  requireConnectedCalendar(user);

  const { timeMin, timeMax } = parseTimeWindow({
    timeMin: args?.timeMin,
    timeMax: args?.timeMax,
    defaultDays: 14
  });

  const maxResults = toClampedInt(args?.maxResults, {
    min: 1,
    max: 100,
    fallback: 30
  });
  const calendarId = String(user?.googleCalendar?.calendarId || 'primary');

  const { calendar } = getCalendarClient({
    accessToken: user.googleCalendar.accessToken,
    refreshToken: user.googleCalendar.refreshToken,
    tokenExpiryDate: user.googleCalendar.tokenExpiryDate
  });

  const response = await calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults
  });

  const events = (response?.data?.items || []).map(normalizeEvent);

  return {
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    count: events.length,
    events
  };
};

const createGoogleCalendarEventTool = async (userId, args = {}) => {
  const user = await loadUserWithCalendar(userId);
  requireConnectedCalendar(user);

  const calendarId = String(user?.googleCalendar?.calendarId || 'primary');
  const eventPayload = createEventPayloadFromArgs(args);

  const { calendar } = getCalendarClient({
    accessToken: user.googleCalendar.accessToken,
    refreshToken: user.googleCalendar.refreshToken,
    tokenExpiryDate: user.googleCalendar.tokenExpiryDate
  });

  const created = await calendar.events.insert({
    calendarId,
    requestBody: eventPayload
  });

  return {
    message: 'Event created',
    calendarId,
    event: normalizeEvent(created.data)
  };
};

const scheduleGoogleCalendarBlockTool = async (userId, args = {}) => {
  const user = await loadUserWithCalendar(userId);
  requireConnectedCalendar(user);

  const durationMinutes = toClampedInt(args?.durationMinutes, {
    min: 5,
    max: 8 * 60,
    fallback: NaN
  });
  if (!Number.isFinite(durationMinutes)) {
    throw new Error('durationMinutes is required and must be between 5 and 480');
  }

  const { timeMin, timeMax } = parseTimeWindow({
    timeMin: args?.timeMin,
    timeMax: args?.timeMax,
    defaultDays: 7
  });

  const calendarId = args?.calendarId
    ? String(args.calendarId).trim()
    : String(user?.googleCalendar?.calendarId || 'primary');
  const conflictStrategyRaw = String(args?.conflictStrategy || 'auto')
    .trim()
    .toLowerCase();
  const conflictStrategy = ALLOWED_CONFLICT_STRATEGIES.has(conflictStrategyRaw)
    ? conflictStrategyRaw
    : 'auto';
  const createEvents = args?.createEvents !== undefined ? Boolean(args.createEvents) : true;
  const title = String(args?.summary || args?.title || 'Practice').trim();
  const description =
    args?.description !== undefined ? String(args.description) : undefined;
  const dashpointType = String(args?.dashpointType || 'skill-practice').trim().toLowerCase();
  const dashpointColor = normalizeDashpointColor(args?.dashpointColor);
  const colorId = resolveColorId({
    colorId: args?.colorId,
    dashpointColor
  });

  const { calendar } = getCalendarClient({
    accessToken: user.googleCalendar.accessToken,
    refreshToken: user.googleCalendar.refreshToken,
    tokenExpiryDate: user.googleCalendar.tokenExpiryDate
  });

  const freeBusyResult = await queryFreeBusy({
    calendar,
    timeMin,
    timeMax,
    calendarIds: [calendarId],
    timeZone: args?.timezone ? String(args.timezone) : undefined
  });

  const busy = (freeBusyResult?.calendars?.[calendarId]?.busy || []).map((row) => ({
    start: row.start,
    end: row.end
  }));

  const plan = planSchedule({
    title,
    durationMinutes,
    windowStart: timeMin,
    windowEnd: timeMax,
    busy,
    conflictStrategy,
    minSessionMinutes: args?.minSessionMinutes,
    maxSplitParts: args?.maxSplitParts,
    allowLightPractice:
      args?.allowLightPractice !== undefined ? Boolean(args.allowLightPractice) : true,
    searchDays: args?.searchDays
  });

  const sessions = Array.isArray(plan?.sessions) ? plan.sessions : [];

  if (!createEvents) {
    return {
      calendarId,
      ...plan,
      sessions: normalizeSessionsForResponse(sessions, plan.title)
    };
  }

  const createdEvents = [];

  for (const session of sessions) {
    const start =
      session?.start instanceof Date
        ? session.start
        : new Date(String(session?.start || ''));
    const end =
      session?.end instanceof Date ? session.end : new Date(String(session?.end || ''));

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      continue;
    }

    const summary = `${plan.title}${
      session?.summarySuffix ? ` (${session.summarySuffix})` : ''
    }`;

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
          ...(session?.lightPractice ? { dashpointIntensity: 'light' } : null)
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
        lightPractice: Boolean(session?.lightPractice)
      },
      event: normalizeEvent(created.data)
    });
  }

  return {
    calendarId,
    ...plan,
    createdEvents,
    message: createdEvents.length ? 'Scheduled event(s) created' : 'No events created'
  };
};

module.exports = {
  getGoogleCalendarStatusTool,
  getGoogleCalendarAuthUrlTool,
  listGoogleCalendarEventsTool,
  createGoogleCalendarEventTool,
  scheduleGoogleCalendarBlockTool
};
