/**
 * FLOW 8 — Token Pause (Emergency)
 * Actor: Admin/Regulator
 * 
 * Pauses the token contract. All token operations (transfers, minting)
 * revert. Unpause resumes operations.
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 8 — Token Pause (Emergency)', () => {

  it('Step 1: Admin pauses the token contract', async () => {
    const res = await request(app).post(`${BASE}/admin/pause`)
      .set('Authorization', 'Bearer jwt-regulator');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('paused', true);
  });

  it('Step 2: Transfer attempt while paused — blocked', async () => {
    const res = await request(app).post(`${BASE}/tokens/transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '10' });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/paused|TOKEN_PAUSED/i);
  });

  it('Step 3: Mint attempt while paused — blocked', async () => {
    const res = await request(app).post(`${BASE}/tokens/mint`)
      .set('Authorization', 'Bearer jwt-agent')
      .send({ wallet: '0xInvestorA', amount: '500' });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/paused|TOKEN_PAUSED/i);
  });

  it('Step 4: Admin unpauses the token contract', async () => {
    const res = await request(app).post(`${BASE}/admin/unpause`)
      .set('Authorization', 'Bearer jwt-regulator');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('paused', false);
  });

  it('Step 5: After unpause, transfer succeeds', async () => {
    const res = await request(app).post(`${BASE}/tokens/transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '10' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('txHash');
  });

  it('Negative: Investor cannot pause token', async () => {
    const res = await request(app).post(`${BASE}/admin/pause`)
      .set('Authorization', 'Bearer jwt-investorA');

    expect(res.status).toBe(403);
  });
});
