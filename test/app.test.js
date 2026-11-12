import { describe, expect, it } from '@jest/globals';
import app from '#src/app.js';
import request from 'supertest';


describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return the welcome message', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.text).toBe('Hello from acquisitions API!');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(Date.parse(response.body.timestamp)).not.toBeNaN();
      expect(response.body.uptime).toEqual(expect.any(Number));
    });
  });

  describe('GET /api', () => {
    it('should return API message', async () => {
      const response = await request(app).get('/api').expect(200);

      expect(response.body).toHaveProperty('message', 'Acquisitions API is running successfully!');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent').expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});