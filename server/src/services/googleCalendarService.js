const { google } = require('googleapis');

const getScopes = () => {
  const raw = process.env.GOOGLE_OAUTH_SCOPES;
  if (raw && raw.trim()) {
    return raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Minimal scopes for calendar read + create/update events
  return [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];
};

const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    const missing = [
      !clientId && 'GOOGLE_CLIENT_ID',
      !clientSecret && 'GOOGLE_CLIENT_SECRET',
      !redirectUri && 'GOOGLE_OAUTH_REDIRECT_URI'
    ].filter(Boolean);
    throw new Error(`Google OAuth not configured (missing: ${missing.join(', ')})`);
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const buildAuthUrl = ({ state }) => {
  const oauth2Client = getOAuth2Client();
  const scopes = getScopes();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    include_granted_scopes: true,
    state
  });
};

const exchangeCodeForTokens = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

const getCalendarClient = ({ accessToken, refreshToken, tokenExpiryDate }) => {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: accessToken || undefined,
    refresh_token: refreshToken || undefined,
    expiry_date: tokenExpiryDate || undefined
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  return { oauth2Client, calendar };
};

const normalizeEvent = (ev) => {
  const start = ev.start?.dateTime || ev.start?.date || null;
  const end = ev.end?.dateTime || ev.end?.date || null;

  const dashpointType =
    ev.extendedProperties?.private?.dashpointType ||
    ev.extendedProperties?.shared?.dashpointType ||
    'event';

  const dashpointColor =
    ev.extendedProperties?.private?.dashpointColor ||
    ev.extendedProperties?.shared?.dashpointColor ||
    null;

  return {
    id: ev.id,
    summary: ev.summary || '(No title)',
    description: ev.description || null,
    location: ev.location || null,
    start,
    end,
    htmlLink: ev.htmlLink || null,
    status: ev.status || null,
    allDay: Boolean(ev.start?.date && !ev.start?.dateTime),
    colorId: ev.colorId || null,
    dashpointType,
    dashpointColor
  };
};

module.exports = {
  getScopes,
  buildAuthUrl,
  exchangeCodeForTokens,
  getCalendarClient,
  normalizeEvent
};
