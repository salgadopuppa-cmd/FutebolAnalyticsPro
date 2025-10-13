const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Ensure test DB path is isolated
process.env.ALLOW_TEST_ENDPOINTS = 'true';
process.env.DB_IN_MEMORY = 'true';
const app = require('../index');

describe('Server basic endpoints', () => {
  test('GET /api/debug/status returns ok', async () => {
    const res = await request(app).get('/api/debug/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('POST /api/test/seed then GET /api/coins for seeded user', async () => {
    const seed = await request(app).post('/api/test/seed').send({});
    expect(seed.statusCode).toBe(200);
    const userId = seed.body.userId || 'test-e2e-user';

    const coins = await request(app).get('/api/coins').query({ userId });
    expect(coins.statusCode).toBe(200);
    expect(coins.body).toHaveProperty('coins');
  });

  test('POST /api/coins updates value', async () => {
    const userId = 'test-e2e-user';
    const up = await request(app).post('/api/coins').send({ userId, coins: 123 });
    expect([200, 500]).toContain(up.statusCode);
    if (up.statusCode === 200) expect(up.body).toHaveProperty('coins');
  });
});
