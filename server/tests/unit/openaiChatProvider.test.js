const { runOpenAiChat } = require('../../src/services/chatProviders/openaiChatProvider');

describe('openaiChatProvider Unit Tests', () => {
  it('should throw error when OPENAI_API_KEY is not configured', async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(
      runOpenAiChat({
        model: 'gpt-4.1-mini',
        systemPrompt: 'System',
        userPrompt: 'User',
        executeToolCall: jest.fn()
      })
    ).rejects.toThrow('OPENAI_API_KEY is not configured');
  });
});
