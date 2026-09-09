const {
  getGoogleCalendarStatusTool,
  getGoogleCalendarAuthUrlTool
} = require('../../src/services/chatCalendarToolService');
const User = require('../../src/models/User');

describe('chatCalendarToolService Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-google-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
    process.env.GOOGLE_OAUTH_REDIRECT_URI = 'http://localhost:5000/api/calendar/callback';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return calendar status when disconnected', async () => {
    const mockUser = {
      _id: 'user-123',
      googleCalendar: { connected: false }
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const status = await getGoogleCalendarStatusTool('user-123');
    expect(status.connected).toBe(false);
    expect(status.calendarId).toBe('primary');
  });

  it('should generate connection auth URL when includeAuthUrl is true', async () => {
    const mockUser = {
      _id: 'user-123',
      googleCalendar: { connected: false }
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const status = await getGoogleCalendarStatusTool('user-123', {
      includeAuthUrl: true,
      redirectPath: '/dashboard'
    });

    expect(status.connected).toBe(false);
    expect(status.connection).toBeDefined();
    expect(status.connection.url).toContain('https://accounts.google.com');
  });

  it('should return auth URL directly from getGoogleCalendarAuthUrlTool', async () => {
    const mockUser = { _id: 'user-123' };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const result = await getGoogleCalendarAuthUrlTool('user-123', { redirectPath: '/focus' });
    expect(result.url).toContain('https://accounts.google.com');
    expect(result.redirectPath).toBe('/focus');
  });
});
