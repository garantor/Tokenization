import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Token Issuance APIs', () => {

  // ─── POST /tokens/mint ─────────────────────────────────────────────

  describe('POST /tokens/mint', () => {
    it('should return 202 with jobId when agent mints tokens', async () => {
      const res = await request(app).post(`${BASE}/tokens/mint`)
        .set('Authorization', 'Bearer jwt-agent')
        .send({ wallet: '0xInvestorA', amount: '1000' });

      expect(res.status).toBe(202);
      expect(res.body).toHaveProperty('jobId');
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).post(`${BASE}/tokens/mint`)
        .send({ wallet: '0xInvestorA', amount: '1000' });

      expect(res.status).toBe(401);
    });

    it('should return 403 when investor tries to mint', async () => {
      const res = await request(app).post(`${BASE}/tokens/mint`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ wallet: '0xInvestorA', amount: '1000' });

      expect(res.status).toBe(403);
    });

    it('should return 400 when amount is missing', async () => {
      const res = await request(app).post(`${BASE}/tokens/mint`)
        .set('Authorization', 'Bearer jwt-agent')
        .send({ wallet: '0xInvestorA' });

      expect(res.status).toBe(400);
    });
  });

  // ─── POST /tokens/batch-mint ───────────────────────────────────────

  describe('POST /tokens/batch-mint', () => {
    it('should return 202 with batch job details when agent batch mints', async () => {
      const res = await request(app).post(`${BASE}/tokens/batch-mint`)
        .set('Authorization', 'Bearer jwt-agent')
        .send({ recipients: [{ wallet: '0x1', amount: '100' }, { wallet: '0x2', amount: '200' }] });

      expect(res.status).toBe(202);
      expect(res.body).toHaveProperty('jobId');
      expect(res.body).toHaveProperty('count', 2);
    });

    it('should return 403 when investor tries to batch mint', async () => {
      const res = await request(app).post(`${BASE}/tokens/batch-mint`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ recipients: [{ wallet: '0x1', amount: '100' }] });

      expect(res.status).toBe(403);
    });
  });

  // ─── POST /tokens/burn ─────────────────────────────────────────────

  describe('POST /tokens/burn', () => {
    it('should return 200 when agent burns tokens', async () => {
      const res = await request(app).post(`${BASE}/tokens/burn`)
        .set('Authorization', 'Bearer jwt-agent')
        .send({ wallet: '0xInvestorA', amount: '100' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'burned');
    });

    it('should return 403 when investor tries to burn', async () => {
      const res = await request(app).post(`${BASE}/tokens/burn`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ wallet: '0xInvestorA', amount: '100' });

      expect(res.status).toBe(403);
    });
  });
});
