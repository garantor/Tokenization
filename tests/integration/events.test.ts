import request from 'supertest';
import { app } from '../../src/app';

const BASE = '/api/v1';

describe('Event Indexer APIs', () => {

  // ─── GET /events/status ────────────────────────────────────────────

  describe('GET /events/status', () => {
    it('should return 200 with indexer sync status', async () => {
      const res = await request(app).get(`${BASE}/events/status`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('lastIndexedBlock');
      expect(typeof res.body.lastIndexedBlock).toBe('number');
      expect(res.body).toHaveProperty('chain');
    });
  });

  // ─── POST /events/resync ───────────────────────────────────────────

  describe('POST /events/resync', () => {
    it('should return 202 when admin triggers reindex', async () => {
      const res = await request(app).post(`${BASE}/events/resync`)
        .set('Authorization', 'Bearer jwt-regulator');

      expect(res.status).toBe(202);
      expect(res.body).toHaveProperty('status', 'resyncing');
    });

    it('should return 403 when investor tries to resync', async () => {
      const res = await request(app).post(`${BASE}/events/resync`)
        .set('Authorization', 'Bearer jwt-investorA');

      expect(res.status).toBe(403);
    });
  });
});
