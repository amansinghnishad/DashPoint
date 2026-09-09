jest.mock('../../src/config/redis', () => {
  let client = null;
  return {
    getRedisClient: jest.fn(() => client),
    __setMockClient: (mock) => {
      client = mock;
    }
  };
});

const redisConfig = require('../../src/config/redis');
const {
  buildChatContextId,
  getCachedChatResponse,
  setCachedChatResponse
} = require('../../src/services/chatResponseCacheService');

describe('chatResponseCacheService Unit Tests', () => {
  afterEach(() => {
    redisConfig.__setMockClient(null);
  });

  describe('buildChatContextId', () => {
    it('should build deterministic context string from parameters', () => {
      const contextId = buildChatContextId({
        userId: 'user-123',
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        topK: 5,
        collectionIds: ['col-b', 'col-a'],
        attemptSignature: 'sig-1'
      });

      expect(contextId).toContain('u:user-123');
      expect(contextId).toContain('scope:col-a,col-b'); // Sorted collection IDs
      expect(contextId).toContain('provider:gemini');
      expect(contextId).toContain('model:gemini-2.0-flash');
      expect(contextId).toContain('topK:5');
    });

    it('should clamp topK within 1 and 8', () => {
      const contextIdHigh = buildChatContextId({ userId: 'u1', topK: 100 });
      expect(contextIdHigh).toContain('topK:8');

      const contextIdLow = buildChatContextId({ userId: 'u1', topK: -5 });
      expect(contextIdLow).toContain('topK:1');
    });
  });

  describe('getCachedChatResponse and setCachedChatResponse', () => {
    it('should return null when Redis is not available', async () => {
      redisConfig.__setMockClient(null);

      const result = await getCachedChatResponse({ prompt: 'Hi', contextId: 'ctx-1' });
      expect(result).toBeNull();

      const setResult = await setCachedChatResponse({
        prompt: 'Hi',
        contextId: 'ctx-1',
        responsePayload: { response: 'Hello' }
      });
      expect(setResult).toBe(false);
    });

    it('should write and read from Redis client mock', async () => {
      const store = new Map();
      const mockRedis = {
        get: jest.fn(async (key) => store.get(key) || null),
        setEx: jest.fn(async (key, ttl, value) => {
          store.set(key, value);
          return 'OK';
        })
      };

      redisConfig.__setMockClient(mockRedis);

      const payload = { response: 'Hello world', provider: 'gemini', model: 'gemini-2.0-flash' };
      const setResult = await setCachedChatResponse({
        prompt: 'What is DashPoint?',
        contextId: 'ctx-test',
        responsePayload: payload
      });

      expect(setResult).toBe(true);
      expect(mockRedis.setEx).toHaveBeenCalled();

      const getResult = await getCachedChatResponse({
        prompt: 'What is DashPoint?',
        contextId: 'ctx-test'
      });

      expect(getResult).not.toBeNull();
      expect(getResult.value.response).toBe('Hello world');
      expect(getResult.value.cachedAt).toBeDefined();
    });
  });
});
