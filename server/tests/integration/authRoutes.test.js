const request = require('supertest');
const app = require('../../src/server');

describe('Auth Routes Integration Tests (Supertest)', () => {
  describe('GET /health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.message).toBe('Dashboard API is running');
    });
  });

  describe('POST /api/auth/register validation', () => {
    it('should reject registration requests with invalid email or missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login validation', () => {
    it('should reject login with empty or invalid payload', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: ''
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 401 when no refresh token cookie or header is present', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should reject unauthenticated logout requests with 401', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should accept authenticated logout with valid Bearer token', async () => {
      const User = require('../../src/models/User');
      jest.spyOn(User, 'findById').mockResolvedValue({
        _id: '507f191e810c19729de860ea',
        isActive: true,
        isLocked: () => false,
        save: jest.fn().mockResolvedValue(true),
        refreshTokens: []
      });

      const { generateToken } = require('../../src/utils/jwt');
      const token = generateToken({ userId: '507f191e810c19729de860ea', email: 'test@dashpoint.dev' });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      User.findById.mockRestore();
    });
  });
});
