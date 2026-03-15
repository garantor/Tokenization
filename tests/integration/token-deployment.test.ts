import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Token Deployment & Configuration APIs', () => {

  // ─── POST /tokens/deploy ───────────────────────────────────────────

  describe('POST /tokens/deploy', () => {
    it('should return 201 with deployed contract addresses when issuer deploys', async () => {
      const res = await request(app).post(`${BASE}/tokens/deploy`)
        .set('Authorization', 'Bearer jwt-issuer')
        .send({ name: 'Acme Security Token', symbol: 'ACME', decimals: 18, complianceModule: 'default' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('tokenAddress');
      expect(res.body.tokenAddress).toMatch(/^0x/);
      expect(res.body).toHaveProperty('identityRegistry');
      expect(res.body).toHaveProperty('complianceContract');
    });

    it('should return 403 when investor tries to deploy', async () => {
      const res = await request(app).post(`${BASE}/tokens/deploy`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ name: 'Hack Token', symbol: 'HCK', decimals: 18 });

      expect(res.status).toBe(403);
    });

    it('should return 400 when required fields missing', async () => {
      const res = await request(app).post(`${BASE}/tokens/deploy`)
        .set('Authorization', 'Bearer jwt-issuer')
        .send({ symbol: 'ACME' });

      expect(res.status).toBe(400);
    });
  });

  // ─── GET /tokens/config ────────────────────────────────────────────

  describe('GET /tokens/config', () => {
    it('should return 200 with token configuration', async () => {
      const res = await request(app).get(`${BASE}/tokens/config`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('symbol');
      expect(res.body).toHaveProperty('decimals');
    });
  });
});
