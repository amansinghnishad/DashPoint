const {
  serializeInsight,
  rejectContentInsight
} = require('../../src/services/contentInsightService');
const ContentInsight = require('../../src/models/ContentInsight');

describe('contentInsightService Unit Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should serialize insight document accurately', () => {
    const mockDoc = {
      _id: 'insight-123',
      sourceType: 'youtube',
      sourceId: 'yt-456',
      status: 'pending',
      summary: 'Summary of video',
      keyPoints: ['Point 1', 'Point 2'],
      tasks: [{ text: 'Task 1', priority: 'high' }],
      deadlines: [],
      entities: ['React', 'Node'],
      confidence: 0.9,
      model: 'gpt-4.1-mini',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const serialized = serializeInsight(mockDoc);
    expect(serialized._id).toBe('insight-123');
    expect(serialized.sourceType).toBe('youtube');
    expect(serialized.keyPoints).toHaveLength(2);
    expect(serialized.tasks[0].text).toBe('Task 1');
  });

  it('should mark insight as rejected', async () => {
    const mockDoc = {
      _id: 'insight-123',
      userId: 'user-1',
      status: 'pending',
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(ContentInsight, 'findOne').mockResolvedValue(mockDoc);

    const result = await rejectContentInsight({ userId: 'user-1', insightId: 'insight-123' });
    expect(mockDoc.status).toBe('rejected');
    expect(mockDoc.save).toHaveBeenCalled();
    expect(result.insight.status).toBe('rejected');
  });
});
