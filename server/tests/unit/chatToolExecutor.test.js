jest.mock('../../src/services/assistantMemoryService', () => ({
  getAssistantMemoryForUser: jest.fn(),
  updateAssistantMemoryForUser: jest.fn()
}));

jest.mock('../../src/services/chatCalendarToolService', () => ({
  getGoogleCalendarStatusTool: jest.fn(),
  getGoogleCalendarAuthUrlTool: jest.fn(),
  listGoogleCalendarEventsTool: jest.fn(),
  createGoogleCalendarEventTool: jest.fn(),
  scheduleGoogleCalendarBlockTool: jest.fn()
}));

const { executeToolCall } = require('../../src/services/chatToolExecutor');
const assistantMemoryService = require('../../src/services/assistantMemoryService');
const calendarToolService = require('../../src/services/chatCalendarToolService');

describe('chatToolExecutor Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error for unsupported tool', async () => {
    await expect(
      executeToolCall({ name: 'unsupportedTool', args: {}, userId: '507f191e810c19729de860ea' })
    ).rejects.toThrow('Unsupported tool: unsupportedTool');
  });

  it('should delegate getAssistantMemory tool call', async () => {
    assistantMemoryService.getAssistantMemoryForUser.mockResolvedValue({
      user: { firstName: 'Alex' },
      memory: { favoriteTopics: ['AI'] }
    });

    const result = await executeToolCall({
      name: 'getAssistantMemory',
      args: {},
      userId: '507f191e810c19729de860ea'
    });

    expect(result.user.firstName).toBe('Alex');
    expect(result.memory.favoriteTopics).toContain('AI');
    expect(assistantMemoryService.getAssistantMemoryForUser).toHaveBeenCalledWith('507f191e810c19729de860ea');
  });

  it('should delegate getGoogleCalendarStatus tool call', async () => {
    calendarToolService.getGoogleCalendarStatusTool.mockResolvedValue({
      connected: true,
      calendarId: 'primary'
    });

    const result = await executeToolCall({
      name: 'getGoogleCalendarStatus',
      args: {},
      userId: '507f191e810c19729de860ea'
    });

    expect(result.connected).toBe(true);
    expect(calendarToolService.getGoogleCalendarStatusTool).toHaveBeenCalledWith(
      '507f191e810c19729de860ea',
      {}
    );
  });
});
