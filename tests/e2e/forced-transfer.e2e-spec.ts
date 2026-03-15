/**
 * FLOW 6 — Forced Transfer (Regulatory Action)
 * Actor: Regulator/Admin
 * 
 * Investor loses wallet access. Admin triggers forced transfer
 * to replacement wallet. Verifies balances updated and event emitted.
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 6 — Forced Transfer (Regulatory Action)', () => {

  it('Step 1: Regulator performs forced transfer', async () => {
    const res = await request(app).post(`${BASE}/admin/force-transfer`)
      .set('Authorization', 'Bearer jwt-regulator')
      .send({ from: '0xLostWallet', to: '0xReplacementWallet', amount: '500' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('txHash');
    expect(res.body).toHaveProperty('from', '0xLostWallet');
    expect(res.body).toHaveProperty('to', '0xReplacementWallet');
  });

  it('Verify: Old wallet balance is zero', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xLostWallet`);

    expect(res.status).toBe(200);
    expect(Number(res.body.balance)).toBe(0);
  });

  it('Verify: New wallet received the tokens', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xReplacementWallet`);

    expect(res.status).toBe(200);
    expect(Number(res.body.balance)).toBe(500);
  });

  it('Verify: ForcedTransfer event captured in history', async () => {
    const res = await request(app).get(`${BASE}/transactions?wallet=0xReplacementWallet`);

    expect(res.status).toBe(200);
    const forcedTx = res.body.transactions.find((t: any) => t.type === 'forced_transfer');
    expect(forcedTx).toBeDefined();
  });

  it('Negative: Investor cannot force transfer', async () => {
    const res = await request(app).post(`${BASE}/admin/force-transfer`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ from: '0xInvestorA', to: '0xHacker', amount: '100' });

    expect(res.status).toBe(403);
  });

  it('Negative: Compliance officer cannot force transfer', async () => {
    const res = await request(app).post(`${BASE}/admin/force-transfer`)
      .set('Authorization', 'Bearer jwt-compliance')
      .send({ from: '0xInvestorA', to: '0xOther', amount: '100' });

    expect(res.status).toBe(403);
  });
});
