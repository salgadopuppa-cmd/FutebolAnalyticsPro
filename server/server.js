const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from parent directory (repository root)
app.use(express.static(path.join(__dirname, '..')));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Mock data generators
function generateMockStandings(leagueName) {
  const teams = [
    { name: 'Fluminense', logo: 'https://via.placeholder.com/30' },
    { name: 'Flamengo', logo: 'https://via.placeholder.com/30' },
    { name: 'Botafogo', logo: 'https://via.placeholder.com/30' },
    { name: 'Palmeiras', logo: 'https://via.placeholder.com/30' },
    { name: 'São Paulo', logo: 'https://via.placeholder.com/30' },
    { name: 'Corinthians', logo: 'https://via.placeholder.com/30' },
  ];

  const standings = teams.map((team, index) => ({
    rank: index + 1,
    team: {
      id: index + 1,
      name: team.name,
      logo: team.logo
    },
    points: 65 - (index * 5),
    all: {
      win: 18 - index,
      draw: 5 + index,
      lose: 2 + index,
      goals: {
        for: 45 - (index * 3),
        against: 20 + (index * 2)
      }
    }
  }));

  return {
    response: [{
      league: {
        standings: [standings]
      }
    }]
  };
}

function generateMockTopScorers(leagueName) {
  const players = [
    { name: 'Pedro', photo: 'https://via.placeholder.com/50', team: 'Flamengo' },
    { name: 'Calleri', photo: 'https://via.placeholder.com/50', team: 'São Paulo' },
    { name: 'Germán Cano', photo: 'https://via.placeholder.com/50', team: 'Fluminense' },
    { name: 'Hulk', photo: 'https://via.placeholder.com/50', team: 'Atlético-MG' },
  ];

  const scorers = players.map((player, index) => ({
    player: {
      id: index + 1,
      name: player.name,
      photo: player.photo
    },
    statistics: [{
      team: {
        id: index + 1,
        name: player.team,
        logo: 'https://via.placeholder.com/30'
      },
      games: {
        appearances: 10 + index,
        cleansheets: 0
      },
      goals: {
        total: 15 - (index * 3),
        assists: 5 - index
      }
    }]
  }));

  return { response: scorers };
}

function generateMockUpcomingMatches(leagueName) {
  const matches = [
    { 
      date: '2025-10-28T19:00:00',
      match: 'Flamengo vs Fluminense',
      probabilities: { home: 45, draw: 30, away: 25 }
    },
    { 
      date: '2025-10-28T21:00:00',
      match: 'Palmeiras vs Corinthians',
      probabilities: { home: 50, draw: 25, away: 25 }
    },
    { 
      date: '2025-10-29T16:00:00',
      match: 'São Paulo vs Botafogo',
      probabilities: { home: 40, draw: 30, away: 30 }
    }
  ];

  return { matches };
}

// Sports API endpoints
const supportedLeagues = [
  'premier', 'laliga', 'seriea-ita', 'libertadores', 'sudamericana', 
  'ucl', 'uel', 'ueconf', 'brasileirao', 'brasileirao-b', 'copadobrasil'
];

// Standings endpoint
app.get('/api/sports/:league-tabela', (req, res) => {
  const league = req.params.league;
  if (!supportedLeagues.includes(league)) {
    return res.status(404).json({ error: 'League not found' });
  }
  res.json(generateMockStandings(league));
});

// Top scorers endpoint
app.get('/api/sports/:league-artilheiros', (req, res) => {
  const league = req.params.league;
  if (!supportedLeagues.includes(league)) {
    return res.status(404).json({ error: 'League not found' });
  }
  res.json(generateMockTopScorers(league));
});

// Upcoming matches endpoint
app.get('/api/sports/:league-proximos', (req, res) => {
  const league = req.params.league;
  if (!supportedLeagues.includes(league)) {
    return res.status(404).json({ error: 'League not found' });
  }
  res.json(generateMockUpcomingMatches(league));
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`Frontend accessible at http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/*`);
});
