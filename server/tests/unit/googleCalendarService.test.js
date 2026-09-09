const {
  getScopes,
  normalizeEvent
} = require('../../src/services/googleCalendarService');

describe('googleCalendarService Unit Tests', () => {
  it('should return default calendar scopes if GOOGLE_OAUTH_SCOPES is unset', () => {
    delete process.env.GOOGLE_OAUTH_SCOPES;
    const scopes = getScopes();
    expect(scopes).toEqual(['https://www.googleapis.com/auth/calendar']);
  });

  it('should normalize Google Calendar event objects', () => {
    const rawEvent = {
      id: 'event-123',
      summary: 'Project Review',
      description: 'Review Sprint 2026',
      start: { dateTime: '2026-08-25T10:00:00.000Z' },
      end: { dateTime: '2026-08-25T11:00:00.000Z' },
      colorId: '5',
      extendedProperties: {
        private: {
          dashpointType: 'task-work',
          dashpointColor: 'warning'
        }
      }
    };

    const normalized = normalizeEvent(rawEvent);
    expect(normalized.id).toBe('event-123');
    expect(normalized.summary).toBe('Project Review');
    expect(normalized.dashpointType).toBe('task-work');
    expect(normalized.dashpointColor).toBe('warning');
    expect(normalized.allDay).toBe(false);
  });

  it('should detect allDay events correctly when start has only date', () => {
    const rawAllDay = {
      id: 'all-day-1',
      summary: 'Public Holiday',
      start: { date: '2026-08-25' },
      end: { date: '2026-08-26' }
    };

    const normalized = normalizeEvent(rawAllDay);
    expect(normalized.allDay).toBe(true);
    expect(normalized.start).toBe('2026-08-25');
  });
});
