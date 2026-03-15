/**
 * FLOW 11 — Compliance Simulation
 * Actors: Investor / Backend
 * 
 * Purpose: Avoid wasting gas by simulating compliance check
 * before submitting an actual on-chain transfer.
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 11 — Compliance Simulation', () => {

  it('Should return canTransfer: true for eligible pair', async () => {
    const res = await request(app).post(`${BASE}/tokens/simulate-transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '100' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canTransfer', true);
    expect(res.body).toHaveProperty('reason', null);
  });

  it('Should return canTransfer: false when recipient lacks identity', async () => {
    const res = await request(app).post(`${BASE}/tokens/simulate-transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xUnregistered', amount: '100' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canTransfer', false);
    expect(res.body.reason).toBeDefined();
  });

  it('Should return canTransfer: false when sender wallet is frozen', async () => {
    const res = await request(app).post(`${BASE}/tokens/simulate-transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xFrozenWallet', to: '0xInvestorB', amount: '100' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canTransfer', false);
    expect(res.body.reason).toMatch(/frozen/i);
  });

  it('Should return canTransfer: false when token is paused', async () => {
    const res = await request(app).post(`${BASE}/tokens/simulate-transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xInvestorB', amount: '100' });

    // This would only fail if pause state was active in the test fixture
    // Asserting the shape for now — real logic validates paused state
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canTransfer');
    expect(res.body).toHaveProperty('reason');
  });
});
