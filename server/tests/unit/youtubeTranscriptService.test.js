const { chunkSegments } = require('../../src/services/youtubeTranscriptService');

describe('youtubeTranscriptService Unit Tests', () => {
  it('should chunk raw transcript segments into bounded overlapping chunks', () => {
    const segments = [
      { text: 'Introduction to React 19 and its compiler.', start: 0, duration: 5 },
      { text: 'How the compiler optimizes re-renders automatically.', start: 5, duration: 5 },
      { text: 'Server components and actions overview.', start: 10, duration: 5 }
    ];

    const chunks = chunkSegments(segments, { maxChars: 100, overlapChars: 20 });
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].text).toContain('Introduction to React 19');
    expect(chunks[0].startSec).toBe(0);
  });

  it('should handle empty segments gracefully', () => {
    const chunks = chunkSegments([]);
    expect(chunks).toEqual([]);
  });
});
