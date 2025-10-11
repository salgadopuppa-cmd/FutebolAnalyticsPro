const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
// Security headers
app.use(helmet());
// Restrict CORS to allowed origins (comma-separated in ALLOWED_ORIGINS), default to localhost for dev
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests like curl or server-to-server
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS blocked: origin not allowed'));
  }
}));
app.use(bodyParser.json());

// Redacting request logger to avoid leaking tokens or secrets
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const safe = { method: req.method, url: req.url };
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    try {
      const bodyCopy = JSON.parse(JSON.stringify(req.body));
      // redact common sensitive keys
      ['idToken', 'password', 'passwd', 'token', 'FIREBASE_SERVICE_ACCOUNT_JSON', 'serviceAccount'].forEach(k => {
        if (bodyCopy[k]) bodyCopy[k] = '[REDACTED]';
      });
      // redact emails partly
      if (bodyCopy.email && typeof bodyCopy.email === 'string') {
        bodyCopy.email = bodyCopy.email.replace(/(.{2}).+(@.+)/, '$1***$2');
      }
      safe.body = bodyCopy;
    } catch (e) {
      safe.body = '[unserializable]';
    }
  }
  console.log(`[${now}] ${safe.method} ${safe.url}` + (safe.body ? ` Body: ${JSON.stringify(safe.body)}` : ''));
  next();
});

// Optional Firebase Admin for verifying ID tokens
let firebaseAdmin = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    const admin = require('firebase-admin');
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firebaseAdmin = admin;
    console.log('Firebase Admin initialized');
  } catch (e) {
    console.warn('Could not initialize Firebase Admin:', e.message || e);
  }
}

// Serve static frontend (assumes server folder is inside project)
app.use(express.static(path.join(__dirname, '..')));

// Ensure data directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const DB_PATH = path.join(DATA_DIR, 'fap.db');

// Initialize SQLite DB
const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      photoURL TEXT,
      coins INTEGER DEFAULT 500
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS featured_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      match TEXT,
      probabilities TEXT
    )
  `);

  // Seed featured_matches if empty
  db.get('SELECT COUNT(*) as cnt FROM featured_matches', (err, row) => {
    if (!err && row && row.cnt === 0) {
      const stmt = db.prepare('INSERT INTO featured_matches (date, match, probabilities) VALUES (?,?,?)');
      stmt.run('2025-10-05 20:00', 'Flamengo vs Palmeiras (Série A)', JSON.stringify({flamengo:55, draw:25, palmeiras:20}));
      stmt.run('2025-10-12 19:00', 'Vasco vs São Paulo (Série A)', JSON.stringify({vasco:30, draw:20, saopaulo:50}));
      stmt.finalize();
    }
  });
});

// Helper to generate user id
function generateUserId() {
  return 'user-' + Math.random().toString(36).slice(2,9);
}

// Auth endpoint - login by email (creates user if not exists)
app.post('/api/auth', (req, res) => {
  const { email, name, idToken } = req.body || {};

  console.log('Auth endpoint hit with payload:', { email: email || null, name: name || null, hasIdToken: !!idToken });

  // If firebaseAdmin initialized and idToken provided, verify it
  if (firebaseAdmin && idToken) {
    console.log('Auth: received idToken, verifying with Firebase Admin...');
    firebaseAdmin.auth().verifyIdToken(idToken).then(decoded => {
      console.log('Auth: idToken verified, uid=', decoded.uid, 'email=', decoded.email);
      const uid = decoded.uid;
      const userEmail = decoded.email || email;
      const displayName = decoded.name || name || 'Analista Pro';
      // find or create user by email
        db.get('SELECT * FROM users WHERE email = ?', [userEmail], (err, row) => {
        if (err) {
          console.error('Auth: DB error on lookup', err);
          return res.status(500).json({ error: 'db error' });
        }
        if (row) return res.json({ userId: row.id, name: row.name, email: row.email, photoURL: row.photoURL, coins: row.coins });
        const userId = uid || generateUserId();
        const photoURL = decoded.picture || 'https://i.imgur.com/2p1x9QZ.png';
        db.run('INSERT INTO users (id, name, email, photoURL, coins) VALUES (?,?,?,?,?)', [userId, displayName, userEmail, photoURL, 500], function(insertErr) {
          if (insertErr) {
            console.error('Auth: DB insert error', insertErr);
            return res.status(500).json({ error: 'db insert error' });
          }
          console.log('Auth: created new user', userId, userEmail);
          return res.json({ userId, name: displayName, email: userEmail, photoURL, coins: 500 });
        });
      });
    }).catch(err => {
      console.warn('Auth: idToken verification failed', err.message || err);
      return res.status(401).json({ error: 'invalid idToken', details: err.message });
    });
    return;
  }

  // Fallback to email-based create/find
  if (!email) return res.status(400).json({ error: 'email required' });
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (err) {
      console.error('Auth: DB error on email fallback', err);
      return res.status(500).json({ error: 'db error' });
    }
    if (row) {
      // return existing
      console.log('Auth: found existing user', row.id, row.email);
      return res.json({ userId: row.id, name: row.name, email: row.email, photoURL: row.photoURL, coins: row.coins });
    }
    // create
    const userId = generateUserId();
    const photoURL = 'https://i.imgur.com/2p1x9QZ.png';
    db.run('INSERT INTO users (id, name, email, photoURL, coins) VALUES (?,?,?,?,?)', [userId, name || 'Analista Pro', email, photoURL, 500], function(insertErr) {
      if (insertErr) return res.status(500).json({ error: 'db insert error' });
      console.log('Auth: created new user (email fallback)', userId, email);
      return res.json({ userId, name: name || 'Analista Pro', email, photoURL, coins: 500 });
    });
  });
});

// GET coins for user
app.get('/api/coins', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  db.get('SELECT coins FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Coins: DB error on GET', err);
      return res.status(500).json({ error: 'db error' });
    }
    const coins = row ? row.coins : 0;
    console.log('Coins: GET for', userId, '=>', coins);
    res.json({ userId, coins });
  });
});

// POST update coins
app.post('/api/coins', (req, res) => {
  const { userId, coins } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  db.run('UPDATE users SET coins = ? WHERE id = ?', [Number(coins) || 0, userId], function(err) {
    if (err) {
      console.error('Coins: DB error on UPDATE', err);
      return res.status(500).json({ error: 'db error' });
    }
    console.log('Coins: UPDATE for', userId, '=>', Number(coins) || 0);
    // Return the updated value by querying
    db.get('SELECT coins FROM users WHERE id = ?', [userId], (qerr, row) => {
      if (qerr) {
        console.error('Coins: DB error on SELECT after UPDATE', qerr);
        return res.json({ userId, coins: Number(coins) || 0 });
      }
      const updated = row ? row.coins : Number(coins) || 0;
      res.json({ userId, coins: updated });
    });
  });
});

// Featured matches
app.get('/api/featured-matches', (req, res) => {
  db.all('SELECT date, match, probabilities FROM featured_matches ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      console.error('Featured matches: DB error', err);
      return res.status(500).json({ error: 'db error' });
    }
    const matches = rows.map(r => ({ date: r.date, match: r.match, probabilities: JSON.parse(r.probabilities) }));
    console.log('Featured matches requested, returning', matches.length, 'rows');
    res.json({ matches });
  });
});

// Simple debug status endpoint
app.get('/api/debug/status', (req, res) => {
  res.json({ status: 'ok', firebaseAdmin: !!firebaseAdmin, dbPath: DB_PATH });
});

// Test-only endpoints: seed and cleanup
if (process.env.ALLOW_TEST_ENDPOINTS === 'true') {
  console.log('Test endpoints enabled: /api/test/seed and /api/test/cleanup');

  app.post('/api/test/seed', (req, res) => {
    // Create deterministic test user(s) and optionally reset featured_matches
    const testUserId = 'test-e2e-user';
    const testEmail = 'test-e2e@example.com';
    const testName = 'E2E Tester';
    const photoURL = 'https://i.imgur.com/2p1x9QZ.png';

    db.get('SELECT * FROM users WHERE id = ?', [testUserId], (err, row) => {
      if (err) {
        console.error('Test seed: DB error', err);
        return res.status(500).json({ error: 'db error' });
      }
      if (row) {
        // update coins to known value
        db.run('UPDATE users SET coins = ? WHERE id = ?', [500, testUserId], function(uerr) {
          if (uerr) console.error('Test seed update error', uerr);
          return res.json({ seeded: true, userId: testUserId });
        });
      } else {
        db.run('INSERT INTO users (id, name, email, photoURL, coins) VALUES (?,?,?,?,?)', [testUserId, testName, testEmail, photoURL, 500], function(insErr) {
          if (insErr) {
            console.error('Test seed insert error', insErr);
            return res.status(500).json({ error: 'db insert error' });
          }
          return res.json({ seeded: true, userId: testUserId });
        });
      }
    });
  });

  app.post('/api/test/cleanup', (req, res) => {
    // Remove deterministic test users and reset featured_matches to seeded state
    db.serialize(() => {
      db.run('DELETE FROM users WHERE id LIKE ?', ['test-e2e%'], function(err) {
        if (err) console.error('Test cleanup users error', err);
      });
      // Optionally remove any extra seeded matches and re-seed default ones
      db.run('DELETE FROM featured_matches', [], function(err) {
        if (err) console.error('Test cleanup featured_matches error', err);
      });
      const stmt = db.prepare('INSERT INTO featured_matches (date, match, probabilities) VALUES (?,?,?)');
      stmt.run('2025-10-05 20:00', 'Flamengo vs Palmeiras (Série A)', JSON.stringify({flamengo:55, draw:25, palmeiras:20}));
      stmt.run('2025-10-12 19:00', 'Vasco vs São Paulo (Série A)', JSON.stringify({vasco:30, draw:20, saopaulo:50}));
      stmt.finalize(() => {
        res.json({ cleaned: true });
      });
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mock API server with SQLite running on http://localhost:${PORT}`);
});
