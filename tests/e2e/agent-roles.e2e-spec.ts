/**
 * FLOW 9 — Agent Role Management
 * Actor: Issuer/Admin
 * 
 * Add a mint agent, verify they can mint. Remove agent,
 * verify they can no longer mint.
 */
import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Flow 9 — Agent Role Management', () => {

  it('Step 1: Issuer adds a new mint agent', async () => {
    const res = await request(app).post(`${BASE}/agents`)
      .set('Authorization', 'Bearer jwt-issuer')
      .send({ wallet: '0xNewAgent', role: 'MINT_AGENT' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('wallet', '0xNewAgent');
    expect(res.body).toHaveProperty('role', 'MINT_AGENT');
  });

  it('Verify: Agent appears in agents list', async () => {
    const res = await request(app).get(`${BASE}/agents`)
      .set('Authorization', 'Bearer jwt-issuer');

    expect(res.status).toBe(200);
    expect(res.body.agents.some((a: any) => a.wallet === '0xNewAgent')).toBe(true);
  });

  it('Step 2: New agent successfully mints tokens', async () => {
    const res = await request(app).post(`${BASE}/tokens/mint`)
      .set('Authorization', 'Bearer jwt-new-agent')
      .send({ wallet: '0xInvestorA', amount: '300' });

    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('jobId');
  });

  it('Step 3: Issuer removes the agent', async () => {
    const res = await request(app).delete(`${BASE}/agents/0xNewAgent`)
      .set('Authorization', 'Bearer jwt-issuer');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'removed');
  });

  it('Step 4: Removed agent attempts mint — forbidden', async () => {
    const res = await request(app).post(`${BASE}/tokens/mint`)
      .set('Authorization', 'Bearer jwt-new-agent')
      .send({ wallet: '0xInvestorA', amount: '300' });

    expect(res.status).toBe(403);
  });

  it('Negative: Investor cannot add agents', async () => {
    const res = await request(app).post(`${BASE}/agents`)
      .set('Authorization', 'Bearer jwt-investorA')
      .send({ wallet: '0xHacker', role: 'MINT_AGENT' });

    expect(res.status).toBe(403);
  });
});
