const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = 'https://v3.football.api-sports.io';

if (!API_FOOTBALL_KEY) { console.warn('Warning: API_FOOTBALL_KEY not set. Sports endpoints will fail.'); }

const cache = new Map();
const TTL = 1000 * 60 * 5; 

async function cachedFetch(key, fn) {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && (now - hit.t) < TTL) { return hit.v; }
  const promise = fn().then((v) => { 
    cache.set(key, { v, t: Date.now() }); 
    return v; 
  }).catch(err => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { v: promise, t: now });
  return promise;
}

async function getStandings(req, res, defaultLeagueId) {
    const { league = defaultLeagueId, season = '2024' } = req.query;
    const cacheKey = `standings:${league}:${season}`;
    try {
        const data = await cachedFetch(cacheKey, async () => {
            const resp = await axios.get(`${API_BASE}/standings`, {
                headers: { 'x-apisports-key': API_FOOTBALL_KEY },
                params: { league, season }
            });
            return {
                standings: resp.data.response[0].league.standings[0].map(item => ({
                    position: item.rank, team: item.team.name, points: item.points,
                    played: item.all.played, won: item.all.win, drawn: item.all.draw, lost: item.all.lose
                }))
            };
        });
        res.json(data);
    } catch (err) {
        console.error(`API-Football error (Standings ${league}):`, err?.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch standings' });
    }
}

async function getScorers(req, res, defaultLeagueId) {
    const { league = defaultLeagueId, season = '2024' } = req.query;
    const cacheKey = `scorers:${league}:${season}`;
    try {
        const data = await cachedFetch(cacheKey, async () => {
            const resp = await axios.get(`${API_BASE}/players/topscorers`, {
                headers: { 'x-apisports-key': API_FOOTBALL_KEY },
                params: { league, season }
            });
            return {
                scorers: resp.data.response.map(item => ({
                    name: item.player.name, team: item.statistics[0].team.name, goals: item.statistics[0].goals.total
                }))
            };
        });
        res.json(data);
    } catch (err) {
        console.error(`API-Football error (Scorers ${league}):`, err?.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch scorers' });
    }
}

router.get('/seriea-tabela', (req, res) => getStandings(req, res, '71'));
router.get('/seriea-artilheiros', (req, res) => getScorers(req, res, '71'));
router.get('/serieb-tabela', (req, res) => getStandings(req, res, '72'));
router.get('/serieb-artilheiros', (req, res) => getScorers(req, res, '72'));
router.get('/premier-tabela', (req, res) => getStandings(req, res, '39'));
router.get('/premier-artilheiros', (req, res) => getScorers(req, res, '39'));
router.get('/laliga-tabela', (req, res) => getStandings(req, res, '140'));
router.get('/laliga-artilheiros', (req, res) => getScorers(req, res, '140'));
router.get('/seriea-ita-tabela', (req, res) => getStandings(req, res, '135'));
router.get('/seriea-ita-artilheiros', (req, res) => getScorers(req, res, '135'));
router.get('/ucl-tabela', (req, res) => getStandings(req, res, '2'));
router.get('/ucl-artilheiros', (req, res) => getScorers(req, res, '2'));
router.get('/libertadores-tabela', (req, res) => getStandings(req, res, '13'));
router.get('/libertadores-artilheiros', (req, res) => getScorers(req, res, '13'));

function generateMockMatches(league) {
    return [ { date: '2025-11-15', home: 'Team A', away: 'Team B', time: '16:00' }, { date: '2025-11-16', home: 'Team C', away: 'Team D', time: '18:30' } ];
}
router.get('/:league-proximos', (req, res) => res.json({ matches: generateMockMatches(req.params.league) }));

module.exports = router;
