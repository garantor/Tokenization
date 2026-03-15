/**
 * FLOW 5 — Wallet Freeze
 * Actor: Compliance Officer
 * 
 * Freezes an investor wallet, verifies transfer blocked,
 * unfreezes wallet, verifies transfer resumes.
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 5 — Wallet Freeze', () => {

  it('Step 1: Compliance officer freezes investor wallet', async () => {
    const res = await request(app).post(`${BASE}/compliance/freeze`)
      .set('Authorization', 'Bearer jwt-compliance')
      .send({ wallet: '0xInvestorA' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('frozen', true);
    expect(res.body).toHaveProperty('wallet', '0xInvestorA');
  });

  it('Verify: Compliance status shows wallet frozen', async () => {
    const res = await request(app).get(`${BASE}/compliance/status/0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('frozen', true);
  });

  it('Step 2: Frozen investor attempts transfer — blocked', async () => {
    const res = await request(app).post(`${BASE}/tokens/transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '50' });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/frozen|WALLET_FROZEN/i);
  });

  it('Step 3: Compliance officer unfreezes wallet', async () => {
    const res = await request(app).post(`${BASE}/compliance/unfreeze`)
      .set('Authorization', 'Bearer jwt-compliance')
      .send({ wallet: '0xInvestorA' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('frozen', false);
  });

  it('Step 4: After unfreeze, transfer succeeds', async () => {
    const res = await request(app).post(`${BASE}/tokens/transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '50' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('txHash');
  });

  it('Negative: Investor cannot freeze wallets', async () => {
    const res = await request(app).post(`${BASE}/compliance/freeze`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ wallet: '0xInvestorB' });

    expect(res.status).toBe(403);
  });
});
