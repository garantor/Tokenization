/**
 * FLOW 7 — Claim Revocation
 * Actor: Trusted Claim Issuer
 * 
 * Issuer revokes KYC claim. Investor attempts transfer — blocked
 * because compliance check fails without valid claim.
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 7 — Claim Revocation', () => {

  it('Step 1: Trusted issuer revokes KYC claim', async () => {
    const res = await request(app).post(`${BASE}/claims/revoke`)
      .set('Authorization', 'Bearer jwt-trusted-issuer')
      .send({ wallet: '0xInvestorA', topic: 'KYC' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'revoked');
  });

  it('Verify: Investor no longer has KYC claim', async () => {
    const res = await request(app).get(`${BASE}/claims/0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body.claims).not.toContain('KYC');
  });

  it('Step 2: Investor with revoked claim attempts transfer — blocked', async () => {
    const res = await request(app).post(`${BASE}/tokens/transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '50' });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/claim|CLAIM_INVALID/i);
  });

  it('Verify: Simulate-transfer also reflects claim revocation', async () => {
    const res = await request(app).post(`${BASE}/tokens/simulate-transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '50' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canTransfer', false);
    expect(res.body.reason).toMatch(/claim/i);
  });

  it('Negative: Investor cannot revoke claims', async () => {
    const res = await request(app).post(`${BASE}/claims/revoke`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ wallet: '0xInvestorA', topic: 'KYC' });

    expect(res.status).toBe(403);
  });
});
