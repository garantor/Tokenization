import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Investor Portfolio APIs', () => {

  // ─── GET /tokens/balance/:wallet ───────────────────────────────────

  describe('GET /tokens/balance/:wallet', () => {
    it('should return 200 with token balance', async () => {
      const res = await request(app).get(`${BASE}/tokens/balance/0xInvestorA`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('wallet', '0xInvestorA');
      expect(res.body).toHaveProperty('balance');
      expect(typeof res.body.balance).toBe('string');
    });
  });

  // ─── GET /investors/:wallet/portfolio ──────────────────────────────

  describe('GET /investors/:wallet/portfolio', () => {
    it('should return 200 with full portfolio details', async () => {
      const res = await request(app).get(`${BASE}/investors/0xInvestorA/portfolio`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('wallet', '0xInvestorA');
      expect(res.body).toHaveProperty('holdings');
      expect(Array.isArray(res.body.holdings)).toBe(true);
    });

    it('should return 404 for unknown investor', async () => {
      const res = await request(app).get(`${BASE}/investors/0xNonExistent/portfolio`);
      expect(res.status).toBe(404);
    });
  });
});
