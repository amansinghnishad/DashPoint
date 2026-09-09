jest.mock('../../src/models/Collection', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/File', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/YouTube', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/PlannerWidget', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/ChatMessage', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/VideoIntelligenceChunk', () => ({
  find: jest.fn()
}));
jest.mock('../../src/models/User', () => ({
  findById: jest.fn()
}));

const { searchAll } = require('../../src/services/universalSearchService');
const Collection = require('../../src/models/Collection');
const File = require('../../src/models/File');
const YouTube = require('../../src/models/YouTube');
const PlannerWidget = require('../../src/models/PlannerWidget');
const ChatMessage = require('../../src/models/ChatMessage');
const VideoIntelligenceChunk = require('../../src/models/VideoIntelligenceChunk');
const User = require('../../src/models/User');

const createQueryMock = (returnValue = []) => {
  const query = {};
  query.sort = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockReturnValue(query);
  query.select = jest.fn().mockReturnValue(query);
  query.lean = jest.fn().mockResolvedValue(returnValue);
  return query;
};

describe('universalSearchService Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty result group for empty query', async () => {
    const result = await searchAll({ userId: '507f191e810c19729de860ea', query: '' });
    expect(result.total).toBe(0);
    expect(result.groups).toEqual([]);
  });

  it('should search collections, files, and widgets for matching keywords', async () => {
    Collection.find.mockReturnValue(
      createQueryMock([
        { _id: 'col-1', name: 'React Notes', description: 'React 19 guide', color: '#ff0000' }
      ])
    );
    File.find.mockReturnValue(createQueryMock([]));
    YouTube.find.mockReturnValue(createQueryMock([]));
    PlannerWidget.find.mockReturnValue(createQueryMock([]));
    ChatMessage.find.mockReturnValue(createQueryMock([]));
    VideoIntelligenceChunk.find.mockReturnValue(createQueryMock([]));

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ googleCalendar: { connected: false } })
    });

    const result = await searchAll({ userId: '507f191e810c19729de860ea', query: 'React' });
    expect(result.total).toBe(1);
    expect(result.groups[0].type).toBe('collections');
    expect(result.groups[0].results[0].title).toBe('React Notes');
  });
});
