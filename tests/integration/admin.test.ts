import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Regulatory Admin APIs', () => {

  // ─── POST /admin/force-transfer ────────────────────────────────────

  describe('POST /admin/force-transfer', () => {
    it('should return 200 with transfer details when regulator forces transfer', async () => {
      const res = await request(app).post(`${BASE}/admin/force-transfer`)
        .set('Authorization', 'Bearer jwt-regulator')
        .send({ from: '0xOldWallet', to: '0xNewWallet', amount: '500' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('txHash');
      expect(res.body).toHaveProperty('from', '0xOldWallet');
      expect(res.body).toHaveProperty('to', '0xNewWallet');
    });

    it('should return 403 when investor tries force transfer', async () => {
      const res = await request(app).post(`${BASE}/admin/force-transfer`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ from: '0xOld', to: '0xNew', amount: '500' });

      expect(res.status).toBe(403);
    });

    it('should return 403 when compliance officer tries force transfer', async () => {
      const res = await request(app).post(`${BASE}/admin/force-transfer`)
        .set('Authorization', 'Bearer jwt-compliance')
        .send({ from: '0xOld', to: '0xNew', amount: '500' });

      expect(res.status).toBe(403);
    });
  });

  // ─── POST /admin/pause ─────────────────────────────────────────────

  describe('POST /admin/pause', () => {
    it('should return 200 when regulator pauses token', async () => {
      const res = await request(app).post(`${BASE}/admin/pause`)
        .set('Authorization', 'Bearer jwt-regulator');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('paused', true);
    });

    it('should return 403 when investor tries to pause', async () => {
      const res = await request(app).post(`${BASE}/admin/pause`)
        .set('Authorization', 'Bearer jwt-investorA');

      expect(res.status).toBe(403);
    });
  });

  // ─── POST /admin/unpause ───────────────────────────────────────────

  describe('POST /admin/unpause', () => {
    it('should return 200 when regulator unpauses token', async () => {
      const res = await request(app).post(`${BASE}/admin/unpause`)
        .set('Authorization', 'Bearer jwt-regulator');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('paused', false);
    });
  });
});
