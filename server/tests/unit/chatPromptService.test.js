const { buildAugmentedChatPrompt } = require('../../src/services/chatPromptService');

describe('chatPromptService Unit Tests', () => {
  it('should build augmented system and user prompt with retrieval context and memory', () => {
    const retrieval = {
      contextText: '[C1] Video Transcript: Introduction to React 19',
      scope: {
        mode: 'collections',
        appliedCollectionNames: ['React Notes']
      },
      items: [{ contextId: 'C1', sourceType: 'youtube', score: 0.95 }]
    };

    const { systemPrompt, userPrompt } = buildAugmentedChatPrompt({
      message: 'Explain the new React features',
      retrieval,
      assistantMemoryText: 'Working hours: 9am - 5pm'
    });

    expect(userPrompt).toBe('Explain the new React features');
    expect(systemPrompt).toContain('You are DashPoint assistant.');
    expect(systemPrompt).toContain('Working hours: 9am - 5pm');
    expect(systemPrompt).toContain('RAG scope is restricted to selected collections: React Notes');
    expect(systemPrompt).toContain('Retrieved workspace context:');
    expect(systemPrompt).toContain('[C1] Video Transcript: Introduction to React 19');
    expect(systemPrompt).toContain('RAG retrieval hit count: 1');
  });

  it('should handle empty retrieval and memory gracefully', () => {
    const { systemPrompt, userPrompt } = buildAugmentedChatPrompt({
      message: 'Hello'
    });

    expect(userPrompt).toBe('Hello');
    expect(systemPrompt).toContain('Retrieved workspace context:\nNone');
    expect(systemPrompt).toContain('Stored assistant memory:\nNone');
  });
});
