import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Health & Diagnostics APIs', () => {

  // ─── GET /health ───────────────────────────────────────────────────

  describe('GET /health', () => {
    it('should return 200 with API health status', async () => {
      const res = await request(app).get(`${BASE}/health`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  // ─── GET /health/blockchain ────────────────────────────────────────

  describe('GET /health/blockchain', () => {
    it('should return 200 with blockchain node connectivity status', async () => {
      const res = await request(app).get(`${BASE}/health/blockchain`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('connected');
      expect(typeof res.body.connected).toBe('boolean');
      expect(res.body).toHaveProperty('chainId');
      expect(res.body).toHaveProperty('blockNumber');
    });
  });
});
