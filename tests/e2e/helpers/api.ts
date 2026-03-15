import request from 'supertest';
// IMPORTANT: Replace this with your actual NestJS INestApplication or Express App instance.
import { app } from '../../../src/app'; // Ensure this points to your app entry point

export async function createInvestor(wallet: string, kycData: any) {
  const res = await request(app)
    .post('/investors/register')
    .send({ wallet, kycData });
  return res;
}

export async function issueClaim(investorWallet: string, topic: number, issuerToken: string) {
  return request(app)
    .post('/claims/issue')
    .set('Authorization', `Bearer ${issuerToken}`)
    .send({ wallet: investorWallet, topic });
}

export async function mintTokens(investorWallet: string, amount: number, agentToken: string) {
  return request(app)
    .post('/tokens/mint')
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ target: investorWallet, amount });
}

export async function transferTokens(fromWallet: string, toWallet: string, amount: number, auth: string) {
  return request(app)
    .post('/tokens/transfer')
    .set('Authorization', `Bearer ${auth}`)
    .send({ from: fromWallet, to: toWallet, amount });
}

export async function freezeWallet(wallet: string, auth: string) {
  return request(app)
    .post('/compliance/freeze')
    .set('Authorization', `Bearer ${auth}`)
    .send({ wallet });
}

export async function forcedTransfer(fromWallet: string, toWallet: string, amount: number, auth: string) {
  return request(app)
    .post('/admin/force-transfer')
    .set('Authorization', `Bearer ${auth}`)
    .send({ from: fromWallet, to: toWallet, amount });
}

export async function addAgent(agentWallet: string, role: string, auth: string) {
  return request(app)
    .post('/admin/add-agent')
    .set('Authorization', `Bearer ${auth}`)
    .send({ agent: agentWallet, role });
}

export async function removeAgent(agentWallet: string, role: string, auth: string) {
  return request(app)
    .post('/admin/remove-agent')
    .set('Authorization', `Bearer ${auth}`)
    .send({ agent: agentWallet, role });
}

export async function batchMint(investors: { target: string, amount: number }[], auth: string) {
  return request(app)
    .post('/tokens/batch-mint')
    .set('Authorization', `Bearer ${auth}`)
    .send({ investors });
}

export async function simulateTransfer(fromWallet: string, toWallet: string, amount: number, auth: string) {
  return request(app)
    .post('/tokens/simulate-transfer')
    .set('Authorization', `Bearer ${auth}`)
    .send({ from: fromWallet, to: toWallet, amount });
}
