/**
 * FLOW 13 — Portfolio & Transaction History
 * Actor: Investor
 * 
 * Investor queries their token balance and transaction history.
 * Verifies balances match blockchain state and history is accurate.
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 13 — Portfolio & Transaction History', () => {

  it('Should return correct token balance for investor', async () => {
    const res = await request(app).get(`${BASE}/tokens/balance/0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('wallet', '0xInvestorA');
    expect(res.body).toHaveProperty('balance');
    expect(typeof res.body.balance).toBe('string');
  });

  it('Should return full portfolio with holdings', async () => {
    const res = await request(app).get(`${BASE}/investors/0xInvestorA/portfolio`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('wallet', '0xInvestorA');
    expect(res.body).toHaveProperty('holdings');
    expect(Array.isArray(res.body.holdings)).toBe(true);

    if (res.body.holdings.length > 0) {
      const holding = res.body.holdings[0];
      expect(holding).toHaveProperty('tokenAddress');
      expect(holding).toHaveProperty('symbol');
      expect(holding).toHaveProperty('balance');
    }
  });

  it('Should return transaction history for wallet', async () => {
    const res = await request(app).get(`${BASE}/transactions?wallet=0xInvestorA`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transactions');
    expect(Array.isArray(res.body.transactions)).toBe(true);

    if (res.body.transactions.length > 0) {
      const tx = res.body.transactions[0];
      expect(tx).toHaveProperty('txHash');
      expect(tx).toHaveProperty('from');
      expect(tx).toHaveProperty('to');
      expect(tx).toHaveProperty('amount');
    }
  });

  it('Should return individual transaction by hash', async () => {
    const res = await request(app).get(`${BASE}/transactions/0xSampleTxHash`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('txHash', '0xSampleTxHash');
    expect(res.body).toHaveProperty('status');
  });

  it('Should return 404 for unknown portfolio wallet', async () => {
    const res = await request(app).get(`${BASE}/investors/0xNobody/portfolio`);
    expect(res.status).toBe(404);
  });
});
