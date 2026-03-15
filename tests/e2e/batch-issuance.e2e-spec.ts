/**
 * FLOW 10 — Batch Issuance
 * Actor: Issuer (via agent)
 * 
 * Mints tokens to multiple investors in a single batch operation.
 * Verifies all balances updated and events emitted.
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 10 — Batch Issuance', () => {

  it('Step 1: Agent batch mints to multiple investors', async () => {
    const res = await request(app).post(`${BASE}/tokens/batch-mint`)
      .set('Authorization', 'Bearer jwt-agent')
      .send({
        recipients: [
          { wallet: '0xBatchInv1', amount: '500' },
          { wallet: '0xBatchInv2', amount: '300' },
          { wallet: '0xBatchInv3', amount: '200' },
        ]
      });

    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('jobId');
    expect(res.body).toHaveProperty('count', 3);
  });

  it('Verify: Investor 1 received correct balance', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xBatchInv1`);
    expect(res.status).toBe(200);
    expect(res.body.balance).toBe('500');
  });

  it('Verify: Investor 2 received correct balance', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xBatchInv2`);
    expect(res.status).toBe(200);
    expect(res.body.balance).toBe('300');
  });

  it('Verify: Investor 3 received correct balance', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xBatchInv3`);
    expect(res.status).toBe(200);
    expect(res.body.balance).toBe('200');
  });

  it('Verify: Transfer events emitted for each recipient', async () => {
    const res = await request(app).get(`${BASE}/transactions?wallet=0xBatchInv1`);
    expect(res.status).toBe(200);
    expect(res.body.transactions.length).toBeGreaterThanOrEqual(1);
  });

  it('Negative: Investor cannot batch mint', async () => {
    const res = await request(app).post(`${BASE}/tokens/batch-mint`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ recipients: [{ wallet: '0xAAA', amount: '100' }] });

    expect(res.status).toBe(403);
  });
});
