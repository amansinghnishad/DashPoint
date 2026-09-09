const {
  getAssistantMemoryForUser,
  updateAssistantMemoryForUser,
  formatAssistantMemoryForPrompt
} = require('../../src/services/assistantMemoryService');
const User = require('../../src/models/User');

describe('assistantMemoryService Unit Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should format default memory when user has no stored preferences', async () => {
    const mockUser = {
      _id: 'user-123',
      firstName: 'Alex',
      lastName: 'Doe',
      preferences: { timezone: 'America/New_York' }
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const formatted = await formatAssistantMemoryForPrompt('user-123');
    expect(formatted).toContain('User profile: Alex Doe');
    expect(formatted).toContain('User timezone preference: America/New_York');
    expect(formatted).toContain('Assistant memory: None stored yet.');
  });

  it('should update and format assistant memory preferences', async () => {
    const mockUser = {
      _id: 'user-123',
      firstName: 'Alex',
      lastName: 'Doe',
      preferences: {
        timezone: 'UTC',
        assistantMemory: {}
      },
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const updateResult = await updateAssistantMemoryForUser('user-123', {
      workingHours: {
        startTime: '09:00',
        endTime: '17:00',
        days: ['Monday', 'Tuesday']
      },
      preferredMeetingLengthMinutes: 45,
      favoriteTopics: ['React', 'Node.js']
    });

    expect(updateResult.memory.workingHours.startTime).toBe('09:00');
    expect(updateResult.memory.preferredMeetingLengthMinutes).toBe(45);
    expect(updateResult.memory.favoriteTopics).toContain('React');
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should clear specific memory fields when requested', async () => {
    const mockUser = {
      _id: 'user-123',
      firstName: 'Alex',
      preferences: {
        assistantMemory: {
          favoriteTopics: ['React', 'Node.js'],
          preferredMeetingLengthMinutes: 30
        }
      },
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const updateResult = await updateAssistantMemoryForUser('user-123', {
      clearFields: ['favoriteTopics', 'preferredMeetingLengthMinutes']
    });

    expect(updateResult.memory.favoriteTopics).toEqual([]);
    expect(updateResult.memory.preferredMeetingLengthMinutes).toBeNull();
  });
});
