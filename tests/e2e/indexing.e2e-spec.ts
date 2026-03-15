/**
 * FLOW 12 — Event Indexing
 * Actor: Backend Indexer
 * 
 * Verifies that blockchain events are captured, stored in DB,
 * and handled idempotently (duplicate blocks don't cause duplication).
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 12 — Event Indexing', () => {

  it('Should return current indexer sync status', async () => {
    const res = await request(app).get(`${BASE}/events/status`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('lastIndexedBlock');
    expect(typeof res.body.lastIndexedBlock).toBe('number');
    expect(res.body).toHaveProperty('chain');
  });

  it('Should capture IdentityRegistered events in DB', async () => {
    // After onboarding an investor, the indexer should have recorded the event
    const res = await request(app).get(`${BASE}/transactions?wallet=0xInvestorA`);

    expect(res.status).toBe(200);
    const identityEvent = res.body.transactions.find(
      (t: any) => t.type === 'identity_registered'
    );
    expect(identityEvent).toBeDefined();
  });

  it('Should capture Transfer events and update portfolio', async () => {
    const balRes = await request(app).get(`${BASE}/tokens/balance/0xInvestorA`);
    expect(balRes.status).toBe(200);

    const txRes = await request(app).get(`${BASE}/transactions?wallet=0xInvestorA`);
    expect(txRes.status).toBe(200);

    // Balance should be consistent with indexed transfer events
    const totalIn = txRes.body.transactions
      .filter((t: any) => t.to === '0xInvestorA')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const totalOut = txRes.body.transactions
      .filter((t: any) => t.from === '0xInvestorA')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    expect(Number(balRes.body.balance)).toBe(totalIn - totalOut);
  });

  it('Should handle idempotent re-indexing without duplicating records', async () => {
    // Trigger resync
    const resync = await request(app).post(`${BASE}/events/resync`)
      .set('Authorization', 'Bearer jwt-regulator');
    expect(resync.status).toBe(202);

    // Query again — count should remain the same
    const res = await request(app).get(`${BASE}/transactions?wallet=0xInvestorA`);
    expect(res.status).toBe(200);

    const uniqueTxHashes = new Set(res.body.transactions.map((t: any) => t.txHash));
    expect(uniqueTxHashes.size).toBe(res.body.transactions.length);
  });

  it('Negative: Investor cannot trigger resync', async () => {
    const res = await request(app).post(`${BASE}/events/resync`)
      .set('Authorization', 'Bearer jwt-investorA');

    expect(res.status).toBe(403);
  });
});
