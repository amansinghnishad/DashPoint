const {
  classifyChatRouting,
  buildChatProviderAttempts,
  MODEL_TIERS,
  CHAT_PROVIDERS
} = require('../../src/services/chatModelRouter');

describe('chatModelRouter Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('classifyChatRouting', () => {
    it('should classify simple greetings and short queries as FAST tier', () => {
      const result = classifyChatRouting({ message: 'Hello, how are you?' });
      expect(result.tier).toBe(MODEL_TIERS.FAST);
    });

    it('should classify tool/workspace queries as BALANCED tier', () => {
      const result = classifyChatRouting({ message: 'Create a new collection for my chemistry notes' });
      expect(result.tier).toBe(MODEL_TIERS.BALANCED);
    });

    it('should classify deep reasoning/analysis queries as STRONG tier', () => {
      const result = classifyChatRouting({
        message: 'Analyze the architectural trade-offs between monolithic and microservice systems step by step'
      });
      expect(result.tier).toBe(MODEL_TIERS.STRONG);
    });

    it('should elevate tier to BALANCED when collectionIds are scoped', () => {
      const result = classifyChatRouting({ message: 'What is this?', collectionIds: ['col-1'] });
      expect(result.tier).toBe(MODEL_TIERS.BALANCED);
    });
  });

  describe('buildChatProviderAttempts', () => {
    it('should throw error for unsupported provider', () => {
      expect(() => {
        buildChatProviderAttempts({ provider: 'anthropic', model: 'claude-3' });
      }).toThrow('Unsupported provider');
    });

    it('should build explicit OpenAI attempts when provider is openai', () => {
      const attempts = buildChatProviderAttempts({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        message: 'Hello'
      });

      expect(attempts).toHaveLength(1);
      expect(attempts[0].provider).toBe('openai');
      expect(attempts[0].model).toBe('gpt-4.1-mini');
    });

    it('should build explicit Gemini attempts when provider is gemini', () => {
      const attempts = buildChatProviderAttempts({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        message: 'Hello'
      });

      expect(attempts).toHaveLength(1);
      expect(attempts[0].provider).toBe('gemini');
      expect(attempts[0].model).toBe('gemini-2.0-flash');
    });

    it('should infer provider from model name when in auto provider mode', () => {
      const attempts = buildChatProviderAttempts({
        provider: 'auto',
        model: 'gemini-2.0-flash',
        message: 'Hello'
      });

      expect(attempts[0].provider).toBe('gemini');
    });

    it('should throw when no provider credentials exist', () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      expect(() => {
        buildChatProviderAttempts({ provider: 'auto', model: 'auto', message: 'Hello' });
      }).toThrow('No AI providers are configured');
    });
  });
});
