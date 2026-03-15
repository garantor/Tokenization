/**
 * FLOW 4 — Secondary Market Transfer
 * Actors: Investor A, Investor B
 * 
 * Precondition: Investor B must have completed onboarding.
 * Simulates compliance check, then executes transfer on-chain.
 */
import request from 'supertest';
import { app } from '../../src/app';
import { publicClient } from './fixtures';

const BASE = '/api/v1';

describe('Flow 4 — Secondary Market Transfer', () => {

  it('Step 1: Pre-flight compliance simulation passes', async () => {
    const res = await request(app).post(`${BASE}/tokens/simulate-transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '200' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canTransfer', true);
    expect(res.body).toHaveProperty('reason', null);
  });

  it('Step 2: Investor A transfers tokens to Investor B', async () => {
    const res = await request(app).post(`${BASE}/tokens/transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '200' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('txHash');
    expect(res.body.txHash).toMatch(/^0x/);
  });

  it('Verify: Investor A balance decreased', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xInvestorA`);

    expect(res.status).toBe(200);
    expect(Number(res.body.balance)).toBe(800); // 1000 - 200
  });

  it('Verify: Investor B balance increased', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xInvestorB`);

    expect(res.status).toBe(200);
    expect(Number(res.body.balance)).toBe(200);
  });

  it('Verify: Transfer event indexed in transaction history', async () => {
    const res = await request(app).get(`${BASE}/transactions?wallet=0xInvestorA`);

    expect(res.status).toBe(200);
    const transferTx = res.body.transactions.find((t: any) =>
      t.to === '0xInvestorB' && t.amount === '200');
    expect(transferTx).toBeDefined();
  });

  it('Negative: Transfer to recipient without KYC claim returns 422', async () => {
    const res = await request(app).post(`${BASE}/tokens/transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xUnregisteredWallet', amount: '50' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('Negative: Simulate transfer to unregistered recipient returns canTransfer false', async () => {
    const res = await request(app).post(`${BASE}/tokens/simulate-transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xUnregisteredWallet', amount: '50' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canTransfer', false);
    expect(res.body.reason).toBeDefined();
  });

  it('Negative: Transfer without auth returns 401', async () => {
    const res = await request(app).post(`${BASE}/tokens/transfer`)
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '50' });

    expect(res.status).toBe(401);
  });
});
