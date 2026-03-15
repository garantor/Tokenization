import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Agent Role Management APIs', () => {

  // ─── POST /agents ──────────────────────────────────────────────────

  describe('POST /agents', () => {
    it('should return 201 when issuer adds a new agent', async () => {
      const res = await request(app).post(`${BASE}/agents`)
        .set('Authorization', 'Bearer jwt-issuer')
        .send({ wallet: '0xNewAgent', role: 'MINT_AGENT' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('wallet', '0xNewAgent');
      expect(res.body).toHaveProperty('role', 'MINT_AGENT');
    });

    it('should return 403 when investor tries to add agent', async () => {
      const res = await request(app).post(`${BASE}/agents`)
        .set('Authorization', 'Bearer jwt-investorA')
        .send({ wallet: '0xNewAgent', role: 'MINT_AGENT' });

      expect(res.status).toBe(403);
    });

    it('should return 400 when role is invalid', async () => {
      const res = await request(app).post(`${BASE}/agents`)
        .set('Authorization', 'Bearer jwt-issuer')
        .send({ wallet: '0xNewAgent', role: 'INVALID_ROLE' });

      expect(res.status).toBe(400);
    });
  });

  // ─── DELETE /agents/:wallet ────────────────────────────────────────

  describe('DELETE /agents/:wallet', () => {
    it('should return 200 when issuer removes an agent', async () => {
      const res = await request(app).delete(`${BASE}/agents/0xNewAgent`)
        .set('Authorization', 'Bearer jwt-issuer');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'removed');
    });

    it('should return 403 when non-owner tries to remove', async () => {
      const res = await request(app).delete(`${BASE}/agents/0xNewAgent`)
        .set('Authorization', 'Bearer jwt-investorA');

      expect(res.status).toBe(403);
    });
  });

  // ─── GET /agents ───────────────────────────────────────────────────

  describe('GET /agents', () => {
    it('should return 200 with list of agents', async () => {
      const res = await request(app).get(`${BASE}/agents`)
        .set('Authorization', 'Bearer jwt-issuer');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('agents');
      expect(Array.isArray(res.body.agents)).toBe(true);
    });
  });
});
