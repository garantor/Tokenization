/**
 * FLOW 3 — Primary Token Issuance
 * Actors: Issuer (via agent), Investor
 * 
 * Mints tokens to a verified investor. Compliance validates the transfer.
 * Transfer event emitted and captured by backend.
 */
import request from 'supertest';
import { app } from '../../src/app';
import { publicClient } from './fixtures';

const BASE = '/api/v1';

describe('Flow 3 — Primary Token Issuance', () => {

  it('Step 1: Agent mints tokens to verified investor', async () => {
    const res = await request(app).post(`${BASE}/tokens/mint`)
      .set('Authorization', 'Bearer jwt-agent')
      .send({ wallet: '0xInvestorA', amount: '1000' });

    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('jobId');
  });

  it('Verify: Investor balance reflects minted amount', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('wallet', '0xInvestorA');
    expect(res.body).toHaveProperty('balance', '1000');
  });

  it('Verify: Transfer event was captured in transaction history', async () => {
    const res = await request(app).get(`${BASE}/transactions?wallet=0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body.transactions.length).toBeGreaterThanOrEqual(1);

    const mintTx = res.body.transactions.find((t: any) =>
      t.from === '0x0000000000000000000000000000000000000000');
    expect(mintTx).toBeDefined();
    expect(mintTx.amount).toBe('1000');
  });

  it('Negative: Investor cannot mint tokens (role enforcement)', async () => {
    const res = await request(app).post(`${BASE}/tokens/mint`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ wallet: '0xInvestorA', amount: '500' });

    expect(res.status).toBe(403);
  });

  it('Negative: Mint without auth returns 401', async () => {
    const res = await request(app).post(`${BASE}/tokens/mint`)
      .send({ wallet: '0xInvestorA', amount: '500' });

    expect(res.status).toBe(401);
  });
});
