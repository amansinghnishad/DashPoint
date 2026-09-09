const {
  sanitizePlainText,
  sanitizeProvider,
  sanitizeModel,
  sanitizeTopK,
  sanitizeCollectionIds,
  sanitizeChatInput
} = require('../../src/utils/agentInputSanitizer');

describe('agentInputSanitizer Unit Tests', () => {
  it('should clean control characters and normalize whitespaces', () => {
    const raw = 'Hello \u0000\u0007 world!\n\n\n\nHow are you?';
    const cleaned = sanitizePlainText(raw);
    expect(cleaned).toBe('Hello world!\n\nHow are you?');
  });

  it('should sanitize provider and fallback to auto for unrecognized providers', () => {
    expect(sanitizeProvider('openai')).toBe('openai');
    expect(sanitizeProvider('gemini')).toBe('gemini');
    expect(sanitizeProvider('unknown-ai')).toBe('auto');
    expect(sanitizeProvider(null)).toBe('auto');
  });

  it('should sanitize model names', () => {
    expect(sanitizeModel('gpt-4.1-mini')).toBe('gpt-4.1-mini');
    expect(sanitizeModel('')).toBe('auto');
  });

  it('should clamp topK values within 1 and 8', () => {
    expect(sanitizeTopK(5)).toBe(5);
    expect(sanitizeTopK(20)).toBe(8);
    expect(sanitizeTopK(-3)).toBe(1);
    expect(sanitizeTopK('invalid')).toBe(3);
  });

  it('should filter only valid MongoDB ObjectIds for collectionIds', () => {
    const ids = ['507f191e810c19729de860ea', 'invalid-id', '507f191e810c19729de860ea'];
    const sanitized = sanitizeCollectionIds(ids);
    expect(sanitized).toHaveLength(1);
    expect(sanitized[0]).toBe('507f191e810c19729de860ea');
  });

  it('should sanitize full chat input payload', () => {
    const payload = {
      message: '  Summarize my notes  ',
      provider: 'GEMINI',
      model: 'gemini-2.0-flash',
      topK: 4,
      collectionIds: ['507f191e810c19729de860ea']
    };

    const sanitized = sanitizeChatInput(payload);
    expect(sanitized.message).toBe('Summarize my notes');
    expect(sanitized.provider).toBe('gemini');
    expect(sanitized.model).toBe('gemini-2.0-flash');
    expect(sanitized.topK).toBe(4);
    expect(sanitized.collectionIds).toHaveLength(1);
  });
});
