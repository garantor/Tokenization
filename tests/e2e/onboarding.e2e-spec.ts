/**
 * FLOW 2 — Investor Onboarding
 * Actors: Investor, Trusted Claim Issuer
 * 
 * Registers investor wallet, backend creates identity in Identity Registry,
 * trusted issuer attaches KYC claim, verifies eligibility.
 */
import request from 'supertest';
import { app } from '../../src/app';
import { publicClient } from './fixtures';

const BASE = '/api/v1';

describe('Flow 2 — Investor Onboarding', () => {

  it('Step 1: Investor registers wallet via API', async () => {
    const res = await request(app).post(`${BASE}/investors/register`)
      .send({ wallet: '0xInvestorA', country: 'GB', kycProviderId: 'sumsub_123', metadata: {} });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('investorId');
    expect(res.body).toHaveProperty('wallet', '0xInvestorA');
  });

  it('Step 2: Trusted claim issuer attaches KYC claim', async () => {
    const res = await request(app).post(`${BASE}/claims/issue`)
      .set('Authorization', 'Bearer jwt-trusted-issuer')
      .send({ wallet: '0xInvestorA', topic: 'KYC', issuer: '0xTrustedIssuer' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'issued');
    expect(res.body).toHaveProperty('claimId');
  });

  it('Verify: Identity is registered on-chain via API', async () => {
    const res = await request(app).get(`${BASE}/investors/0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('identityRegistered', true);
    expect(res.body).toHaveProperty('frozen', false);
  });

  it('Verify: KYC claim exists for investor', async () => {
    const res = await request(app).get(`${BASE}/claims/0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body.claims).toContain('KYC');
  });

  it('Verify: Investor is eligible to receive tokens (backend status)', async () => {
    const res = await request(app).get(`${BASE}/investors/0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body.identityRegistered).toBe(true);
    expect(res.body.claims).toContain('KYC');
  });

  it('Negative: Registering duplicate wallet returns 409', async () => {
    // First registration already done above
    const res = await request(app).post(`${BASE}/investors/register`)
      .send({ wallet: '0xInvestorA', country: 'GB', kycProviderId: 'sumsub_123' });

    expect(res.status).toBe(409);
  });
});
