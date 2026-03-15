import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Compliance Control APIs', () => {

  // ─── POST /compliance/freeze ───────────────────────────────────────

  describe('POST /compliance/freeze', () => {
    it('should return 200 when compliance officer freezes wallet', async () => {
      const res = await request(app).post(`${BASE}/compliance/freeze`)
        .set('Authorization', 'Bearer jwt-compliance')
        .send({ wallet: '0xInvestorB' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('frozen', true);
      expect(res.body).toHaveProperty('wallet', '0xInvestorB');
    });

    it('should return 403 when investor tries to freeze', async () => {
      const res = await request(app).post(`${BASE}/compliance/freeze`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ wallet: '0xInvestorB' });

      expect(res.status).toBe(403);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).post(`${BASE}/compliance/freeze`)
        .send({ wallet: '0xInvestorB' });

      expect(res.status).toBe(401);
    });
  });

  // ─── POST /compliance/unfreeze ─────────────────────────────────────

  describe('POST /compliance/unfreeze', () => {
    it('should return 200 when compliance officer unfreezes wallet', async () => {
      const res = await request(app).post(`${BASE}/compliance/unfreeze`)
        .set('Authorization', 'Bearer jwt-compliance')
        .send({ wallet: '0xInvestorB' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('frozen', false);
    });

    it('should return 403 when investor tries to unfreeze', async () => {
      const res = await request(app).post(`${BASE}/compliance/unfreeze`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ wallet: '0xInvestorB' });

      expect(res.status).toBe(403);
    });
  });

  // ─── POST /compliance/freeze-tokens ────────────────────────────────

  describe('POST /compliance/freeze-tokens', () => {
    it('should return 200 when compliance officer freezes specific token amount', async () => {
      const res = await request(app).post(`${BASE}/compliance/freeze-tokens`)
        .set('Authorization', 'Bearer jwt-compliance')
        .send({ wallet: '0xInvestorB', amount: '500' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('frozenAmount', '500');
    });
  });

  // ─── GET /compliance/status/:wallet ────────────────────────────────

  describe('GET /compliance/status/:wallet', () => {
    it('should return 200 with compliance status', async () => {
      const res = await request(app).get(`${BASE}/compliance/status/0xInvestorB`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('wallet', '0xInvestorB');
      expect(res.body).toHaveProperty('frozen');
      expect(res.body).toHaveProperty('frozenTokens');
    });
  });
});
