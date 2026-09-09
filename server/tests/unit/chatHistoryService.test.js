const mongoose = require('mongoose');
const { saveChatTurn } = require('../../src/services/chatHistoryService');
const ChatMessage = require('../../src/models/ChatMessage');
const ChatSession = require('../../src/models/ChatSession');

describe('chatHistoryService Unit Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should insert user and assistant chat messages into ChatMessage collection', async () => {
    const mockInsert = jest.spyOn(ChatMessage, 'insertMany').mockResolvedValue([
      { role: 'user', content: 'What is AI?' },
      { role: 'assistant', content: 'Artificial Intelligence' }
    ]);

    const result = await saveChatTurn({
      userId: '507f191e810c19729de860ea',
      userMessage: 'What is AI?',
      assistantMessage: 'Artificial Intelligence',
      provider: 'gemini',
      model: 'gemini-2.0-flash'
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it('should auto-title new session based on the first prompt', async () => {
    const sessionId = new mongoose.Types.ObjectId();
    const mockSession = {
      _id: sessionId,
      title: 'New Conversation',
      lastMessageAt: null,
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(ChatMessage, 'insertMany').mockResolvedValue([]);
    jest.spyOn(ChatSession, 'findOne').mockResolvedValue(mockSession);

    await saveChatTurn({
      userId: '507f191e810c19729de860ea',
      sessionId: sessionId.toString(),
      userMessage: 'How to build scalable microservices in Node.js?',
      assistantMessage: 'Here are key principles...'
    });

    expect(mockSession.title).toBe('How to build scalable microservices in Node.j...');
    expect(mockSession.lastMessageAt).toBeInstanceOf(Date);
    expect(mockSession.save).toHaveBeenCalled();
  });
});
