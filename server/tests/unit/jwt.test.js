const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  hashToken
} = require('../../src/utils/jwt');

describe('JWT & Security Utilities Unit Tests', () => {
  const mockPayload = {
    id: '507f191e810c19729de860ea',
    email: 'test@dashpoint.dev'
  };

  it('should generate and verify an access token', () => {
    const token = generateToken(mockPayload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(mockPayload.id);
    expect(decoded.email).toBe(mockPayload.email);
  });

  it('should generate a refresh token with jti and verify it', () => {
    const token = generateRefreshToken(mockPayload);
    expect(typeof token).toBe('string');

    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(mockPayload.id);
    expect(typeof decoded.jti).toBe('string');
  });

  it('should generate deterministic SHA256 hashes for tokens', () => {
    const raw = 'my-secure-sample-token-12345';
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // 32 bytes in hex = 64 chars
  });
});
