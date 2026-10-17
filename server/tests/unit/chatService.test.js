jest.mock('../../src/features/chat/services/chatModelRouter', () => ({
  buildChatProviderAttempts: jest.fn()
}));

jest.mock('../../src/features/chat/services/chatResponseCacheService', () => ({
  buildChatContextId: jest.fn(() => 'test-cache-context-id'),
  getCachedChatResponse: jest.fn(),
  setCachedChatResponse: jest.fn()
}));

jest.mock('../../src/services/assistantMemoryService', () => ({
  formatAssistantMemoryForPrompt: jest.fn()
}));

jest.mock('../../src/features/chat/services/chatContextService', () => ({
  retrieveChatContext: jest.fn(() => Promise.resolve({ items: [], contextText: '', topK: 3 })),
  DEFAULT_TOP_K: 3
}));

jest.mock('../../src/features/chat/services/chatPromptService', () => ({
  buildAugmentedChatPrompt: jest.fn(() => ({ systemPrompt: 'System', userPrompt: 'User' }))
}));

jest.mock('../../src/features/chat/services/providers/geminiChatProvider', () => ({
  runGeminiChat: jest.fn()
}));

const { runChat } = require('../../src/features/chat/services/chatService');
const chatModelRouter = require('../../src/features/chat/services/chatModelRouter');
const chatResponseCacheService = require('../../src/features/chat/services/chatResponseCacheService');
const assistantMemoryService = require('../../src/services/assistantMemoryService');
const geminiProvider = require('../../src/features/chat/services/providers/geminiChatProvider');

describe('chatService Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached response when cache hit occurs', async () => {
    chatModelRouter.buildChatProviderAttempts.mockReturnValue([
      { provider: 'gemini', model: 'gemini-2.0-flash', route: { tier: 'fast' } }
    ]);

    chatResponseCacheService.getCachedChatResponse.mockResolvedValue({
      key: 'cached-key',
      value: {
        response: 'Cached answer',
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        mutations: { toolCalls: 0, tools: [], collectionChanged: false },
        retrieval: { count: 0, items: [] }
      }
    });

    const result = await runChat({
      userId: '507f191e810c19729de860ea',
      message: 'What is DashPoint?'
    });

    expect(result.response).toBe('Cached answer');
    expect(result.cache.hit).toBe(true);
  });

  it('should execute chat provider when no cache exists', async () => {
    chatModelRouter.buildChatProviderAttempts.mockReturnValue([
      { provider: 'gemini', model: 'gemini-2.0-flash', route: { tier: 'fast' } }
    ]);

    chatResponseCacheService.getCachedChatResponse.mockResolvedValue(null);
    assistantMemoryService.formatAssistantMemoryForPrompt.mockResolvedValue('Memory: None');
    geminiProvider.runGeminiChat.mockResolvedValue({
      text: 'Fresh AI response',
      toolExecutions: []
    });

    const result = await runChat({
      userId: '507f191e810c19729de860ea',
      message: 'Hello'
    });

    expect(result.response).toBe('Fresh AI response');
    expect(result.cache.hit).toBe(false);
  });
});
