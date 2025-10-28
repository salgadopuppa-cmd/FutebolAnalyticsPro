const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = 'https://v3.football.api-sports.io';

if (!API_FOOTBALL_KEY) {
  console.warn('Warning: API_FOOTBALL_KEY not set. Sports endpoints will fail until configured.');
}

// Competition map with sensible defaults; allow overrides via environment variables
let COMPETITION_MAP = {
  brasileirao_a: process.env.BRASILEIRAO_A_LEAGUE_ID || '71',
  brasileirao_b: process.env.BRASILEIRAO_B_LEAGUE_ID || '72',
  copadobrasil: process.env.COPA_DO_BRASIL_LEAGUE_ID || ''
};

// Optional: allow a JSON blob in env to override many mappings at once
if (process.env.COMPETITION_MAP_JSON) {
  try {
    const parsed = JSON.parse(process.env.COMPETITION_MAP_JSON);
    COMPETITION_MAP = Object.assign({}, COMPETITION_MAP, parsed);
  } catch (e) {
    console.warn('Invalid COMPETITION_MAP_JSON env var, ignoring:', e.message);
  }
}

router.get('/brasileirao-tabela', async (req, res) => {
  try {
    const resp = await axios.get(`${API_BASE}/standings`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY },
      params: { league: 71, season: 2024 }
    });
    res.json(resp.data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.get('/brasileirao-artilheiros', async (req, res) => {
  try {
    const resp = await axios.get(`${API_BASE}/players/topscorers`, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY },
      params: { league: 71, season: 2024 }
    });
    res.json(resp.data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Simple in-memory cache to reduce API-Football calls (TTL in ms)
const cache = new Map();
const TTL = 1000 * 60 * 2; // 2 minutes

function cachedFetch(key, fn) {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && (now - hit.t) < TTL) {
    return hit.v;
  }
  return fn().then((v) => { cache.set(key, { v, t: Date.now() }); return v; });
}

// Serie B endpoints (defaults may be overridden with ?league=ID&season=YYYY)
router.get('/brasileirao-b-tabela', async (req, res) => {
  const league = req.query.league || 72; // default guess; override via ?league=
  const season = req.query.season || 2024;
  const cacheKey = `standings:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/standings`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.get('/brasileirao-b-artilheiros', async (req, res) => {
  const league = req.query.league || 72;
  const season = req.query.season || 2024;
  const cacheKey = `topscorers:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players/topscorers`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Copa do Brasil endpoints
router.get('/copadobrasil-tabela', async (req, res) => {
  // Copa do Brasil may not be represented by a single league id in API-Football.
  // Allow overriding the league id via query param; default to configured map.
  const league = req.query.league || COMPETITION_MAP.copadobrasil || '';
  const season = req.query.season || 2024;
  if (!league) {
    return res.status(400).json({ error: 'league query param required for Copa do Brasil (e.g. ?league=ID)' });
  }
  const cacheKey = `standings:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/standings`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.get('/copadobrasil-artilheiros', async (req, res) => {
  const league = req.query.league || COMPETITION_MAP.copadobrasil || '';
  const season = req.query.season || 2024;
  if (!league) {
    return res.status(400).json({ error: 'league query param required for Copa do Brasil (e.g. ?league=ID)' });
  }
  const cacheKey = `topscorers:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players/topscorers`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Additional endpoints: assists, cards, goalkeepers, upcoming matches

router.get('/brasileirao-assistencias', async (req, res) => {
  const league = req.query.league || 71;
  const season = req.query.season || 2024;
  const cacheKey = `assist:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season, // endpoint-specific may require filtering on statistics
        }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch assists' });
  }
});

router.get('/brasileirao-cartoes', async (req, res) => {
  const league = req.query.league || 71;
  const season = req.query.season || 2024;
  const cacheKey = `cards:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      // API-Football doesn't offer a single 'cards' endpoint for leaders; use players endpoint and inspect statistics
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

router.get('/brasileirao-goleiros', async (req, res) => {
  const league = req.query.league || 71;
  const season = req.query.season || 2024;
  const cacheKey = `gk:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season, position: 'Goalkeeper' }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch goalkeepers' });
  }
});

router.get('/brasileirao-proximos', async (req, res) => {
  const league = req.query.league || 71;
  const season = req.query.season || 2024;
  const from = req.query.from || undefined; // optional date filters
  const to = req.query.to || undefined;
  const cacheKey = `next:${league}:${season}:${from||''}:${to||''}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const params = { league, season };
      if (from) params.from = from;
      if (to) params.to = to;
      const resp = await axios.get(`${API_BASE}/fixtures`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch upcoming matches' });
  }
});

// Duplicate for Serie B (league defaults to COMPETITION_MAP or 72)
router.get('/brasileirao-b-assistencias', async (req, res) => {
  const league = req.query.league || COMPETITION_MAP.brasileirao_b || 72;
  const season = req.query.season || 2024;
  const cacheKey = `assist:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch assists' });
  }
});

router.get('/brasileirao-b-cartoes', async (req, res) => {
  const league = req.query.league || COMPETITION_MAP.brasileirao_b || 72;
  const season = req.query.season || 2024;
  const cacheKey = `cards:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

router.get('/brasileirao-b-goleiros', async (req, res) => {
  const league = req.query.league || COMPETITION_MAP.brasileirao_b || 72;
  const season = req.query.season || 2024;
  const cacheKey = `gk:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season, position: 'Goalkeeper' }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch goalkeepers' });
  }
});

// Copa duplicates (use COMPETITION_MAP.copadobrasil if available)
router.get('/copadobrasil-assistencias', async (req, res) => {
  const league = req.query.league || COMPETITION_MAP.copadobrasil || '';
  const season = req.query.season || 2024;
  if(!league) return res.status(400).json({ error: 'league id required' });
  const cacheKey = `assist:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch assists' });
  }
});

router.get('/copadobrasil-cartoes', async (req, res) => {
  const league = req.query.league || COMPETITION_MAP.copadobrasil || '';
  const season = req.query.season || 2024;
  if(!league) return res.status(400).json({ error: 'league id required' });
  const cacheKey = `cards:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

router.get('/copadobrasil-goleiros', async (req, res) => {
  const league = req.query.league || COMPETITION_MAP.copadobrasil || '';
  const season = req.query.season || 2024;
  if(!league) return res.status(400).json({ error: 'league id required' });
  const cacheKey = `gk:${league}:${season}`;
  try {
    const data = await cachedFetch(cacheKey, async () => {
      const resp = await axios.get(`${API_BASE}/players`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        params: { league, season, position: 'Goalkeeper' }
      });
      return resp.data;
    });
    res.json(data);
  } catch (err) {
    console.error('api-football error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch goalkeepers' });
  }
});

// Expose competition mapping for clients/admins (non-sensitive)
router.get('/competitions', (req, res) => {
  return res.json({ map: COMPETITION_MAP });
});

router.get('/competitions/:key', (req, res) => {
  const k = req.params.key;
  if (!k) return res.status(400).json({ error: 'key required' });
  const val = COMPETITION_MAP[k];
  if (typeof val === 'undefined') return res.status(404).json({ error: 'not found' });
  return res.json({ key: k, value: val });
});

module.exports = router;

