import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Transaction Tracking APIs', () => {

  // ─── GET /transactions/:txHash ─────────────────────────────────────

  describe('GET /transactions/:txHash', () => {
    it('should return 200 with transaction details', async () => {
      const res = await request(app).get(`${BASE}/transactions/0xSomeTxHash`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('txHash', '0xSomeTxHash');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('from');
      expect(res.body).toHaveProperty('to');
    });

    it('should return 404 for unknown transaction hash', async () => {
      const res = await request(app).get(`${BASE}/transactions/0xNonExistentHash`);
      expect(res.status).toBe(404);
    });
  });

  // ─── GET /transactions ─────────────────────────────────────────────

  describe('GET /transactions', () => {
    it('should return 200 with filtered transactions for a wallet', async () => {
      const res = await request(app).get(`${BASE}/transactions?wallet=0xInvestorA`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);
    });

    it('should return 400 when wallet query param is missing', async () => {
      const res = await request(app).get(`${BASE}/transactions`);
      expect(res.status).toBe(400);
    });
  });
});
