jest.mock('../../src/models/User', () => ({
  findById: jest.fn()
}));
jest.mock('../../src/models/Collection', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/PlannerWidget', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/File', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/YouTube', () => ({
  find: jest.fn()
}));
jest.mock('../../src/services/assistantMemoryService', () => ({
  getAssistantMemoryForUser: jest.fn()
}));

const { getFocusSummary } = require('../../src/services/focusService');
const User = require('../../src/models/User');
const Collection = require('../../src/models/Collection');
const PlannerWidget = require('../../src/models/PlannerWidget');
const File = require('../../src/models/File');
const YouTube = require('../../src/models/YouTube');
const assistantMemoryService = require('../../src/services/assistantMemoryService');

const createQueryMock = (returnValue = []) => {
  const query = {};
  query.sort = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockReturnValue(query);
  query.select = jest.fn().mockReturnValue(query);
  query.lean = jest.fn().mockResolvedValue(returnValue);
  return query;
};

describe('focusService Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate focus summary aggregating widgets, files, videos, and assistant memory', async () => {
    const mockUser = {
      _id: '507f191e810c19729de860ea',
      preferences: { timezone: 'UTC' },
      googleCalendar: { connected: false }
    };

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    assistantMemoryService.getAssistantMemoryForUser.mockResolvedValue({
      user: { timezone: 'UTC' },
      memory: {
        preferredMeetingLengthMinutes: 30,
        taskPriorities: ['Deploy release'],
        recurringGoals: ['Daily standup']
      }
    });

    PlannerWidget.find.mockReturnValue(
      createQueryMock([
        {
          _id: 'w-1',
          title: 'Action items',
          widgetType: 'todo-list',
          data: { items: [{ text: 'Review PR', done: false }] }
        }
      ])
    );

    Collection.find.mockReturnValue(createQueryMock([]));
    File.find.mockReturnValue(createQueryMock([]));
    YouTube.find.mockReturnValue(createQueryMock([]));

    const summary = await getFocusSummary({ userId: '507f191e810c19729de860ea' });
    expect(summary.today).toBeDefined();
    expect(summary.pendingTasks).toHaveLength(1);
    expect(summary.pendingTasks[0].text).toBe('Review PR');
    expect(summary.memory.taskPriorities).toContain('Deploy release');
  });
});
