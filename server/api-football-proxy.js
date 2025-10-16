const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = 'https://v3.football.api-sports.io';

if (!API_FOOTBALL_KEY) {
  console.warn('Warning: API_FOOTBALL_KEY not set. Sports endpoints will fail until configured.');
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

module.exports = router;
