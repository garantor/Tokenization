import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Claim Management APIs', () => {

  // ─── POST /claims/issue ────────────────────────────────────────────

  describe('POST /claims/issue', () => {
    it('should return 201 with claimId when issued by trusted claim issuer', async () => {
      const res = await request(app).post(`${BASE}/claims/issue`)
        .set('Authorization', 'Bearer jwt-trusted-issuer')
        .send({ wallet: '0xInvestorA', topic: 'KYC', issuer: '0xIssuerWallet' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'issued');
      expect(res.body).toHaveProperty('claimId');
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).post(`${BASE}/claims/issue`)
        .send({ wallet: '0xInvestorA', topic: 'KYC' });

      expect(res.status).toBe(401);
    });

    it('should return 403 when investor tries to issue claims', async () => {
      const res = await request(app).post(`${BASE}/claims/issue`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ wallet: '0xInvestorA', topic: 'KYC', issuer: '0xInvestorA' });

      expect(res.status).toBe(403);
    });
  });

  // ─── POST /claims/revoke ───────────────────────────────────────────

  describe('POST /claims/revoke', () => {
    it('should return 200 when trusted issuer revokes claim', async () => {
      const res = await request(app).post(`${BASE}/claims/revoke`)
        .set('Authorization', 'Bearer jwt-trusted-issuer')
        .send({ wallet: '0xInvestorA', topic: 'KYC' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'revoked');
    });

    it('should return 403 when investor tries to revoke', async () => {
      const res = await request(app).post(`${BASE}/claims/revoke`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ wallet: '0xInvestorA', topic: 'KYC' });

      expect(res.status).toBe(403);
    });
  });

  // ─── GET /claims/:wallet ───────────────────────────────────────────

  describe('GET /claims/:wallet', () => {
    it('should return 200 with list of claims', async () => {
      const res = await request(app).get(`${BASE}/claims/0xInvestorA`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('claims');
      expect(Array.isArray(res.body.claims)).toBe(true);
    });
  });

  // ─── POST /claims/topics ───────────────────────────────────────────

  describe('POST /claims/topics', () => {
    it('should return 201 when compliance officer adds a claim topic', async () => {
      const res = await request(app).post(`${BASE}/claims/topics`)
        .set('Authorization', 'Bearer jwt-compliance')
        .send({ topic: 'ACCREDITED_INVESTOR' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('topic', 'ACCREDITED_INVESTOR');
    });

    it('should return 403 when investor tries to add topic', async () => {
      const res = await request(app).post(`${BASE}/claims/topics`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ topic: 'ACCREDITED_INVESTOR' });

      expect(res.status).toBe(403);
    });
  });

  // ─── GET /claims/topics ────────────────────────────────────────────

  describe('GET /claims/topics', () => {
    it('should return 200 with list of registered topics', async () => {
      const res = await request(app).get(`${BASE}/claims/topics`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('topics');
      expect(Array.isArray(res.body.topics)).toBe(true);
    });
  });
});
