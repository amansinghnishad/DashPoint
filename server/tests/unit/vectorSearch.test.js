const {
  cosineSimilarity,
  runLocalVectorSearchFallback
} = require('../../src/services/vectorSearchService');

describe('Vector Search & Cosine Similarity Unit Tests', () => {
  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const vec = [0.2, 0.5, 0.8];
      expect(cosineSimilarity(vec, vec)).toBeCloseTo(1, 4);
    });

    it('should return 0 for perpendicular/orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      expect(cosineSimilarity(vecA, vecB)).toBe(0);
    });

    it('should correctly calculate cosine similarity for typical embeddings', () => {
      const vecA = [1, 0];
      const vecB = [1, 1]; // cos(45 deg) ~ 0.7071
      expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0.7071, 3);
    });

    it('should handle zero or empty vectors safely without NaN', () => {
      expect(cosineSimilarity([], [])).toBe(0);
      expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
      expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    });
  });

  describe('runLocalVectorSearchFallback', () => {
    it('should rank in-memory candidates by similarity and apply limits and projection', async () => {
      const mockDocs = [
        { _id: 'doc-1', title: 'Python Machine Learning', embedding: [1, 0, 0] },
        { _id: 'doc-2', title: 'React Frontend Architecture', embedding: [0, 1, 0] },
        { _id: 'doc-3', title: 'Python Data Science', embedding: [0.8, 0.2, 0] }
      ];

      const mockModel = {
        find: () => ({
          limit: () => ({
            lean: async () => mockDocs
          })
        })
      };

      const results = await runLocalVectorSearchFallback({
        model: mockModel,
        queryVector: [1, 0, 0],
        limit: 2,
        project: { _id: 1, title: 1, score: { $meta: 'vectorSearchScore' } }
      });

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Python Machine Learning');
      expect(results[0].score).toBeCloseTo(1, 4);
      expect(results[1].title).toBe('Python Data Science');
      expect(results[1].score).toBeGreaterThan(0.7);
    });
  });
});
