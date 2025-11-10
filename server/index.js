/**
 * Minimal mock server for Futebol Analytics Pro
 *
 * Endpoints:
 * POST  /api/auth              -> { userId, name, email, photoURL }
 * GET   /api/coins?userId=...  -> { coins }
 * POST  /api/coins             -> { ok: true }
 * GET   /api/featured-matches  -> { matches: [...] }
 * GET   /api/ranking?limit=10  -> { ranking: [...] }
 *
 * Serves static files from the parent directory so you can open http://localhost:3000
 * and load the frontend (index.html, app.js, etc).
 *
 * Persistence: server/data/db.json (simple JSON file). Best-effort async writes.
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const DEFAULT_DB = {
  users: {},   // userId -> { userId, name, email, photoURL }
  coins: {},   // userId -> number
  // ranking can be computed from coins
};

async function ensureDataDir() {
  try {
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    if (!existsSync(DB_PATH)) {
      await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Failed to ensure data dir / db:', err);
    throw err;
  }
}

async function readDB() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.warn('readDB error, returning default DB:', e);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

async function writeDB(db) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.warn('writeDB error:', e);
  }
}

function safeNumber(n, fallback = 0) {
  const parsed = Number(n);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function start() {
  await ensureDataDir();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve front-end static files from parent folder (project root)
  const frontendRoot = path.join(__dirname, '..');
  app.use(express.static(frontendRoot));

  // Basic liveness
  app.get('/_health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  /**
   * POST /api/auth
   * Body examples:
   * - { idToken: '...' }          // mock firebase token case (we don't verify)
   * - { name: 'User', email: 'u@example.com' }
   *
   * Returns user object with generated userId.
   */
  app.post('/api/auth', async (req, res) => {
    try {
      const db = await readDB();
      let { idToken, name, email } = req.body || {};

      let userId;
      let user;

      if (idToken) {
        // In a real server you'd verify the idToken. Here we mock it:
        // derive a stable userId from the token by hashing/truncating (simple).
        // For simplicity use uuidv4() so each idToken yields new user unless you
        // want stable mapping — callers can pass userId instead in the future.
        userId = uuidv4();
        name = name || 'Firebase User';
        email = email || `user+${userId.substring(0, 8)}@example.com`;
        user = { userId, name, email, photoURL: '' };
      } else if (name || email) {
        userId = uuidv4();
        name = name || 'Local User';
        email = email || `local+${userId.substring(0, 8)}@example.com`;
        user = { userId, name, email, photoURL: '' };
      } else {
        return res.status(400).json({ error: 'invalid_auth_payload', message: 'Provide idToken or name/email' });
      }

      // store user if not present
      db.users = db.users || {};
      db.coins = db.coins || {};

      if (!db.users[userId]) {
        db.users[userId] = user;
      } else {
        // Merge updates if present
        db.users[userId] = Object.assign({}, db.users[userId], user);
      }

      // Ensure coin balance exists (default 500)
      if (!Number.isFinite(db.coins[userId])) {
        db.coins[userId] = 500;
      }

      await writeDB(db);

      // Return basic user info (no sensitive tokens)
      return res.json({ userId: db.users[userId].userId, name: db.users[userId].name, email: db.users[userId].email, photoURL: db.users[userId].photoURL });
    } catch (e) {
      console.error('POST /api/auth error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  /**
   * GET /api/coins?userId=...
   * Returns { coins }
   */
  app.get('/api/coins', async (req, res) => {
    try {
      const { userId } = req.query || {};
      const db = await readDB();
      const coins = (userId && db.coins && Number.isFinite(db.coins[userId])) ? db.coins[userId] : 0;
      return res.json({ coins });
    } catch (e) {
      console.error('GET /api/coins error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  /**
   * POST /api/coins
   * Body: { userId, coins }
   * Updates the user's coins balance.
   */
  app.post('/api/coins', async (req, res) => {
    try {
      const { userId, coins } = req.body || {};
      if (!userId || !Object.prototype.hasOwnProperty.call(req.body, 'coins')) {
        return res.status(400).json({ error: 'invalid_payload', message: 'userId and coins required' });
      }
      const db = await readDB();
      db.coins = db.coins || {};
      db.coins[userId] = safeNumber(coins, 0);
      await writeDB(db);
      return res.json({ ok: true, userId, coins: db.coins[userId] });
    } catch (e) {
      console.error('POST /api/coins error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  /**
   * GET /api/featured-matches
   * Returns a list of upcoming matches with AI probabilities (mocked).
   */
  app.get('/api/featured-matches', async (req, res) => {
    try {
      // small mocked dataset
      const matches = [
        {
          id: 'm1',
          date: '2025-11-05T20:00:00-03:00',
          match: 'Flamengo vs Fluminense',
          probabilities: { Flamengo: 45, Fluminense: 35, Draw: 20 }
        },
        {
          id: 'm2',
          date: '2025-11-06T18:00:00-03:00',
          match: 'Palmeiras vs Atlético-MG',
          probabilities: { Palmeiras: 50, 'Atlético-MG': 30, Draw: 20 }
        },
        {
          id: 'm3',
          date: '2025-11-07T21:00:00-03:00',
          match: 'Corinthians vs São Paulo',
          probabilities: { Corinthians: 40, 'São Paulo': 40, Draw: 20 }
        }
      ];
      return res.json({ matches });
    } catch (e) {
      console.error('GET /api/featured-matches error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  /**
   * GET /api/ranking?limit=10
   * Returns leaderboard derived from coins stored in DB.
   */
  app.get('/api/ranking', async (req, res) => {
    try {
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
      const db = await readDB();
      const coins = db.coins || {};
      const users = db.users || {};

      const arr = Object.keys(coins).map(userId => {
        const u = users[userId] || { userId, name: `User ${userId.substring(0,6)}` };
        return { userId, name: u.name || '', coins: safeNumber(coins[userId], 0) };
      });

      arr.sort((a, b) => b.coins - a.coins);

      const ranking = arr.slice(0, limit).map((r, idx) => ({ rank: idx + 1, userId: r.userId, name: r.name, coins: r.coins }));
      return res.json({ ranking });
    } catch (e) {
      console.error('GET /api/ranking error', e);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // Optional: very small admin/test-only endpoints (guarded by env var)
  if (process.env.ALLOW_TEST_ENDPOINTS === 'true') {
    app.post('/__test/seed', async (req, res) => {
      try {
        const db = await readDB();
        // seed some users and coins
        const u1 = uuidv4(), u2 = uuidv4(), u3 = uuidv4();
        db.users[u1] = { userId: u1, name: 'Alice', email: 'alice@example.com' };
        db.users[u2] = { userId: u2, name: 'Bob', email: 'bob@example.com' };
        db.users[u3] = { userId: u3, name: 'Camila', email: 'camila@example.com' };
        db.coins[u1] = 1500;
        db.coins[u2] = 900;
        db.coins[u3] = 1200;
        await writeDB(db);
        return res.json({ ok: true });
      } catch (e) {
        console.error('POST /__test/seed error', e);
        return res.status(500).json({ error: 'server_error' });
      }
    });

    app.post('/__test/cleanup', async (req, res) => {
      try {
        await writeDB(JSON.parse(JSON.stringify(DEFAULT_DB)));
        return res.json({ ok: true });
      } catch (e) {
        console.error('POST /__test/cleanup error', e);
        return res.status(500).json({ error: 'server_error' });
      }
    });
  }

  // Fallback 404 for api routes (so static file serving still works)
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  app.listen(PORT, () => {
    console.log(`Mock server listening on http://localhost:${PORT}`);
    console.log(`Serving frontend from ${frontendRoot}`);
    console.log(`DB path: ${DB_PATH}`);
    if (process.env.ALLOW_TEST_ENDPOINTS === 'true') {
      console.log('Test endpoints enabled: POST /__test/seed and POST /__test/cleanup');
    }
  });
}

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
