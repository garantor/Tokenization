/**
 * FLOW 1 — Platform Bootstrapping
 * Actor: Issuer / Admin
 * 
 * Deploys the ERC-3643 token suite, configures registries, claim topics,
 * trusted issuers, and assigns agent roles.
 */
import request from 'supertest';
import { app } from '../../src/app';
import { publicClient } from './fixtures';

const BASE = '/api/v1';

describe('Flow 1 — Platform Bootstrapping', () => {
  let tokenAddress: string;
  let identityRegistry: string;
  let complianceContract: string;

  it('Step 1: Issuer deploys ERC-3643 token suite via factory', async () => {
    const res = await request(app).post(`${BASE}/tokens/deploy`)
      .set('Authorization', 'Bearer jwt-issuer')
      .send({ name: 'Acme Security Token', symbol: 'ACME', decimals: 18, complianceModule: 'default' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('tokenAddress');
    expect(res.body.tokenAddress).toMatch(/^0x/);
    expect(res.body).toHaveProperty('identityRegistry');
    expect(res.body).toHaveProperty('complianceContract');

    tokenAddress = res.body.tokenAddress;
    identityRegistry = res.body.identityRegistry;
    complianceContract = res.body.complianceContract;
  });

  it('Step 2: Admin configures claim topics (KYC)', async () => {
    const res = await request(app).post(`${BASE}/claims/topics`)
      .set('Authorization', 'Bearer jwt-compliance')
      .send({ topic: 'KYC' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('topic', 'KYC');
  });

  it('Step 3: Admin registers trusted claim issuer', async () => {
    const res = await request(app).post(`${BASE}/issuers/trusted`)
      .set('Authorization', 'Bearer jwt-regulator')
      .send({ issuerWallet: '0xTrustedIssuer', topics: ['KYC'] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('issuerWallet', '0xTrustedIssuer');
  });

  it('Step 4: Admin assigns mint agent role', async () => {
    const res = await request(app).post(`${BASE}/agents`)
      .set('Authorization', 'Bearer jwt-issuer')
      .send({ wallet: '0xMintAgent', role: 'MINT_AGENT' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('wallet', '0xMintAgent');
    expect(res.body).toHaveProperty('role', 'MINT_AGENT');
  });

  it('Verify: Claim topics exist on-chain', async () => {
    const res = await request(app).get(`${BASE}/claims/topics`);

    expect(res.status).toBe(200);
    expect(res.body.topics).toContain('KYC');
  });

  it('Verify: Trusted issuer is registered', async () => {
    const res = await request(app).get(`${BASE}/issuers/trusted`);

    expect(res.status).toBe(200);
    expect(res.body.issuers.some((i: any) => i.wallet === '0xTrustedIssuer')).toBe(true);
  });

  it('Verify: Token config is accessible', async () => {
    const res = await request(app).get(`${BASE}/tokens/config`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Acme Security Token');
    expect(res.body).toHaveProperty('symbol', 'ACME');
  });
});
