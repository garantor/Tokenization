import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Trusted Issuer Management APIs', () => {

  // ─── POST /issuers/trusted ─────────────────────────────────────────

  describe('POST /issuers/trusted', () => {
    it('should return 201 when admin adds a trusted issuer', async () => {
      const res = await request(app).post(`${BASE}/issuers/trusted`)
        .set('Authorization', 'Bearer jwt-regulator')
        .send({ issuerWallet: '0xTrustedIssuer', topics: ['KYC'] });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('issuerWallet', '0xTrustedIssuer');
      expect(res.body).toHaveProperty('topics');
    });

    it('should return 403 when investor tries to add issuer', async () => {
      const res = await request(app).post(`${BASE}/issuers/trusted`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ issuerWallet: '0xHacker', topics: ['KYC'] });

      expect(res.status).toBe(403);
    });
  });

  // ─── DELETE /issuers/trusted/:wallet ───────────────────────────────

  describe('DELETE /issuers/trusted/:wallet', () => {
    it('should return 200 when admin removes a trusted issuer', async () => {
      const res = await request(app).delete(`${BASE}/issuers/trusted/0xTrustedIssuer`)
        .set('Authorization', 'Bearer jwt-regulator');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'removed');
    });

    it('should return 403 when non-admin attempts removal', async () => {
      const res = await request(app).delete(`${BASE}/issuers/trusted/0xTrustedIssuer`)
        .set('Authorization', 'Bearer jwt-investorA');

      expect(res.status).toBe(403);
    });
  });

  // ─── GET /issuers/trusted ──────────────────────────────────────────

  describe('GET /issuers/trusted', () => {
    it('should return 200 with list of trusted issuers', async () => {
      const res = await request(app).get(`${BASE}/issuers/trusted`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('issuers');
      expect(Array.isArray(res.body.issuers)).toBe(true);
    });
  });
});
