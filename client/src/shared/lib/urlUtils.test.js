import { describe, it, expect } from 'vitest';

import {
  extractYouTubeId,
  validateYouTubeUrl,
  getYouTubeThumbnail,
  validateUrl,
  getDomainFromUrl
} from './urlUtils';

describe('urlUtils Unit Tests', () => {
  it('should extract YouTube video ID from various formats', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should validate YouTube URLs', () => {
    expect(validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(validateYouTubeUrl('https://google.com')).toBe(false);
    expect(validateYouTubeUrl('')).toBe(false);
  });

  it('should construct YouTube thumbnail URLs', () => {
    expect(getYouTubeThumbnail('dQw4w9WgXcQ')).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg');
  });

  it('should validate URLs and extract domain names', () => {
    expect(validateUrl('https://dashpoint.dev')).toBe(true);
    expect(validateUrl('invalid-url')).toBe(false);
    expect(getDomainFromUrl('https://dashpoint.dev/dashboard')).toBe('dashpoint.dev');
  });
});
