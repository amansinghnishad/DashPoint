const { retrieveChatContext, DEFAULT_TOP_K } = require('../../src/services/chatContextService');
const embeddingsService = require('../../src/services/embeddingsService');

describe('chatContextService Unit Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty retrieval when query has no embeddings provider', async () => {
    jest.spyOn(embeddingsService, 'createEmbedding').mockResolvedValue({
      vector: null,
      provider: 'none'
    });

    const result = await retrieveChatContext({
      userId: '507f191e810c19729de860ea',
      query: 'React query',
      topK: 3
    });

    expect(result.items).toEqual([]);
    expect(result.contextText).toBe('');
    expect(result.topK).toBe(3);
  });

  it('should default topK to DEFAULT_TOP_K', () => {
    expect(DEFAULT_TOP_K).toBe(3);
  });
});
