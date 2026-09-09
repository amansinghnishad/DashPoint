const { runGeminiChat } = require('../../src/services/chatProviders/geminiChatProvider');

describe('geminiChatProvider Unit Tests', () => {
  it('should throw error when GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(
      runGeminiChat({
        model: 'gemini-2.0-flash',
        systemPrompt: 'System',
        userPrompt: 'User',
        executeToolCall: jest.fn()
      })
    ).rejects.toThrow('GEMINI_API_KEY is not configured');
  });
});
