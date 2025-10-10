const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
        if (err) return res.status(500).json({ error: 'db error' });
        if (row) return res.json({ userId: row.id, name: row.name, email: row.email, photoURL: row.photoURL, coins: row.coins });
        const userId = uid || generateUserId();
        const photoURL = decoded.picture || 'https://i.imgur.com/2p1x9QZ.png';
        db.run('INSERT INTO users (id, name, email, photoURL, coins) VALUES (?,?,?,?,?)', [userId, displayName, userEmail, photoURL, 500], function(insertErr) {
          if (insertErr) return res.status(500).json({ error: 'db insert error' });
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
    if (err) return res.status(500).json({ error: 'db error' });
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
    if (err) return res.status(500).json({ error: 'db error' });
    console.log('Coins: UPDATE for', userId, '=>', Number(coins) || 0);
    res.json({ userId, coins: Number(coins) || 0 });
  });
});

// Featured matches
app.get('/api/featured-matches', (req, res) => {
  db.all('SELECT date, match, probabilities FROM featured_matches ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    const matches = rows.map(r => ({ date: r.date, match: r.match, probabilities: JSON.parse(r.probabilities) }));
    console.log('Featured matches requested, returning', matches.length, 'rows');
    res.json({ matches });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mock API server with SQLite running on http://localhost:${PORT}`);
});
