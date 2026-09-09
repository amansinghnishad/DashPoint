const {
  isNoteWidgetType,
  buildPlannerWidgetEmbeddingText,
  resolveEmbeddingConfig,
  getEmbeddingModelLabel
} = require('../../src/services/embeddingsService');

describe('embeddingsService Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should identify note widget types correctly', () => {
    expect(isNoteWidgetType('notes')).toBe(true);
    expect(isNoteWidgetType('notes-tomorrow')).toBe(true);
    expect(isNoteWidgetType('todo-list')).toBe(false);
    expect(isNoteWidgetType('appointments')).toBe(false);
  });

  it('should construct embedding text for planner widgets', () => {
    const text = buildPlannerWidgetEmbeddingText({
      title: 'Meeting Notes',
      data: { text: 'Discuss Q3 goals and milestones.' }
    });

    expect(text).toContain('Meeting Notes');
    expect(text).toContain('Discuss Q3 goals and milestones.');
  });

  it('should resolve embedding config based on active provider credentials', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    const config = resolveEmbeddingConfig({ provider: 'openai' });
    expect(config.provider).toBe('openai');
    expect(config.model).toBe('text-embedding-3-small');

    const label = getEmbeddingModelLabel(config);
    expect(label).toBe('openai:text-embedding-3-small');
  });

  it('should return null when credentials are missing', () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const config = resolveEmbeddingConfig({ provider: 'openai' });
    expect(config).toBeNull();
  });
});
