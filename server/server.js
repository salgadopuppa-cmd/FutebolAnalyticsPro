const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '2.1.0'
    });
});

// Mock data generators
function generateMockStandings(league) {
    const teams = {
        'premier': ['Manchester City', 'Arsenal', 'Liverpool', 'Aston Villa', 'Tottenham', 'Chelsea', 'Newcastle', 'Manchester Utd'],
        'laliga': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Real Sociedad', 'Athletic Bilbao', 'Valencia', 'Sevilla', 'Villarreal'],
        'seriea-ita': ['Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina'],
        'libertadores': ['Flamengo', 'Palmeiras', 'River Plate', 'Boca Juniors', 'Fluminense', 'Athletico-PR', 'Gremio', 'Internacional'],
        'sudamericana': ['Independiente del Valle', 'LDU Quito', 'Fortaleza', 'Corinthians', 'Racing', 'Atletico Mineiro', 'Sao Paulo', 'Santos'],
        'ucl': ['Bayern Munich', 'Real Madrid', 'Manchester City', 'Barcelona', 'PSG', 'Inter Milan', 'Arsenal', 'Atletico Madrid'],
        'uel': ['Bayer Leverkusen', 'Liverpool', 'Roma', 'West Ham', 'Brighton', 'Freiburg', 'Atalanta', 'Marseille'],
        'ueconf': ['Aston Villa', 'Fiorentina', 'Olympiacos', 'Club Brugge', 'Ajax', 'AEK Athens', 'Fenerbahce', 'Lille'],
        'brasileirao': ['Fluminense', 'Flamengo', 'Botafogo', 'Palmeiras', 'São Paulo', 'Cruzeiro', 'Corinthians', 'Internacional'],
        'brasileirao-b': ['Vasco', 'Bahia', 'Grêmio', 'Criciúma', 'Sport', 'Ceará', 'Goiás', 'Vitória'],
        'copadobrasil': ['São Paulo', 'Flamengo', 'Corinthians', 'Palmeiras', 'Grêmio', 'Atlético-MG', 'Bahia', 'Cruzeiro']
    };
    
    const leagueTeams = teams[league] || teams['premier'];
    return leagueTeams.map((team, idx) => ({
        position: idx + 1,
        team: team,
        points: 70 - (idx * 5),
        played: 25 + Math.floor(Math.random() * 3),
        won: 18 - idx,
        drawn: 4 + Math.floor(Math.random() * 3),
        lost: 3 + idx
    }));
}

function generateMockScorers(league) {
    const scorers = {
        'premier': [
            { name: 'Erling Haaland', team: 'Manchester City', goals: 22 },
            { name: 'Mohamed Salah', team: 'Liverpool', goals: 18 },
            { name: 'Ollie Watkins', team: 'Aston Villa', goals: 16 },
            { name: 'Cole Palmer', team: 'Chelsea', goals: 15 }
        ],
        'laliga': [
            { name: 'Robert Lewandowski', team: 'Barcelona', goals: 20 },
            { name: 'Jude Bellingham', team: 'Real Madrid', goals: 17 },
            { name: 'Antoine Griezmann', team: 'Atletico Madrid', goals: 15 },
            { name: 'Alvaro Morata', team: 'Atletico Madrid', goals: 13 }
        ],
        'seriea-ita': [
            { name: 'Lautaro Martinez', team: 'Inter Milan', goals: 21 },
            { name: 'Victor Osimhen', team: 'Napoli', goals: 18 },
            { name: 'Dusan Vlahovic', team: 'Juventus', goals: 16 },
            { name: 'Olivier Giroud', team: 'AC Milan', goals: 14 }
        ],
        'libertadores': [
            { name: 'Pedro', team: 'Flamengo', goals: 12 },
            { name: 'Germán Cano', team: 'Fluminense', goals: 10 },
            { name: 'Rony', team: 'Palmeiras', goals: 9 },
            { name: 'Miguel Borja', team: 'River Plate', goals: 8 }
        ],
        'sudamericana': [
            { name: 'Yuri Alberto', team: 'Corinthians', goals: 8 },
            { name: 'Pedro Raul', team: 'Fortaleza', goals: 7 },
            { name: 'Calleri', team: 'São Paulo', goals: 6 },
            { name: 'Hulk', team: 'Atletico Mineiro', goals: 6 }
        ],
        'ucl': [
            { name: 'Harry Kane', team: 'Bayern Munich', goals: 9 },
            { name: 'Kylian Mbappé', team: 'PSG', goals: 8 },
            { name: 'Erling Haaland', team: 'Manchester City', goals: 7 },
            { name: 'Vinicius Jr', team: 'Real Madrid', goals: 6 }
        ],
        'uel': [
            { name: 'Victor Boniface', team: 'Bayer Leverkusen', goals: 6 },
            { name: 'Mohamed Salah', team: 'Liverpool', goals: 5 },
            { name: 'Paulo Dybala', team: 'Roma', goals: 5 },
            { name: 'Jarrod Bowen', team: 'West Ham', goals: 4 }
        ],
        'ueconf': [
            { name: 'Ollie Watkins', team: 'Aston Villa', goals: 5 },
            { name: 'Nicolas Gonzalez', team: 'Fiorentina', goals: 4 },
            { name: 'Ayoub El Kaabi', team: 'Olympiacos', goals: 4 },
            { name: 'Brian Brobbey', team: 'Ajax', goals: 3 }
        ],
        'brasileirao': [
            { name: 'Tiquinho Soares', team: 'Botafogo', goals: 18 },
            { name: 'Pedro', team: 'Flamengo', goals: 15 },
            { name: 'Germán Cano', team: 'Fluminense', goals: 14 },
            { name: 'Rony', team: 'Palmeiras', goals: 12 }
        ],
        'brasileirao-b': [
            { name: 'Vegetti', team: 'Vasco', goals: 16 },
            { name: 'Everaldo', team: 'Bahia', goals: 14 },
            { name: 'Diego Souza', team: 'Grêmio', goals: 12 },
            { name: 'Eder', team: 'Criciúma', goals: 10 }
        ],
        'copadobrasil': [
            { name: 'Calleri', team: 'São Paulo', goals: 8 },
            { name: 'Pedro', team: 'Flamengo', goals: 7 },
            { name: 'Yuri Alberto', team: 'Corinthians', goals: 6 },
            { name: 'Rony', team: 'Palmeiras', goals: 5 }
        ]
    };
    
    return scorers[league] || scorers['premier'];
}

function generateMockMatches(league) {
    const matches = {
        'premier': [
            { date: '2025-11-01', home: 'Manchester City', away: 'Arsenal', time: '15:00' },
            { date: '2025-11-01', home: 'Liverpool', away: 'Chelsea', time: '17:30' },
            { date: '2025-11-02', home: 'Tottenham', away: 'Manchester Utd', time: '14:00' }
        ],
        'laliga': [
            { date: '2025-11-01', home: 'Real Madrid', away: 'Barcelona', time: '21:00' },
            { date: '2025-11-01', home: 'Atletico Madrid', away: 'Sevilla', time: '16:15' },
            { date: '2025-11-02', home: 'Valencia', away: 'Athletic Bilbao', time: '18:30' }
        ],
        'seriea-ita': [
            { date: '2025-11-01', home: 'Inter Milan', away: 'Juventus', time: '20:45' },
            { date: '2025-11-01', home: 'AC Milan', away: 'Napoli', time: '18:00' },
            { date: '2025-11-02', home: 'Roma', away: 'Lazio', time: '15:00' }
        ],
        'libertadores': [
            { date: '2025-11-05', home: 'Flamengo', away: 'Palmeiras', time: '21:30' },
            { date: '2025-11-05', home: 'River Plate', away: 'Boca Juniors', time: '21:00' },
            { date: '2025-11-06', home: 'Fluminense', away: 'Gremio', time: '19:00' }
        ],
        'sudamericana': [
            { date: '2025-11-07', home: 'Fortaleza', away: 'Corinthians', time: '21:30' },
            { date: '2025-11-07', home: 'Racing', away: 'Independiente del Valle', time: '21:00' },
            { date: '2025-11-08', home: 'São Paulo', away: 'Santos', time: '19:00' }
        ],
        'ucl': [
            { date: '2025-11-03', home: 'Bayern Munich', away: 'Real Madrid', time: '21:00' },
            { date: '2025-11-03', home: 'Manchester City', away: 'Barcelona', time: '21:00' },
            { date: '2025-11-04', home: 'PSG', away: 'Inter Milan', time: '21:00' }
        ],
        'uel': [
            { date: '2025-11-03', home: 'Liverpool', away: 'Roma', time: '18:45' },
            { date: '2025-11-03', home: 'Bayer Leverkusen', away: 'West Ham', time: '18:45' },
            { date: '2025-11-04', home: 'Atalanta', away: 'Brighton', time: '18:45' }
        ],
        'ueconf': [
            { date: '2025-11-03', home: 'Aston Villa', away: 'Ajax', time: '21:00' },
            { date: '2025-11-03', home: 'Fiorentina', away: 'Olympiacos', time: '18:45' },
            { date: '2025-11-04', home: 'Club Brugge', away: 'Fenerbahce', time: '18:45' }
        ],
        'brasileirao': [
            { date: '2025-11-10', home: 'Flamengo', away: 'Fluminense', time: '16:00' },
            { date: '2025-11-10', home: 'Palmeiras', away: 'Corinthians', time: '18:30' },
            { date: '2025-11-10', home: 'São Paulo', away: 'Santos', time: '20:00' }
        ],
        'brasileirao-b': [
            { date: '2025-11-10', home: 'Vasco', away: 'Grêmio', time: '16:00' },
            { date: '2025-11-10', home: 'Bahia', away: 'Sport', time: '18:30' },
            { date: '2025-11-11', home: 'Criciúma', away: 'Ceará', time: '16:00' }
        ],
        'copadobrasil': [
            { date: '2025-11-12', home: 'São Paulo', away: 'Corinthians', time: '21:30' },
            { date: '2025-11-13', home: 'Flamengo', away: 'Palmeiras', time: '21:30' },
            { date: '2025-11-14', home: 'Grêmio', away: 'Atlético-MG', time: '21:30' }
        ]
    };
    
    return matches[league] || matches['premier'];
}

// Generic endpoints for all leagues
const leagues = [
    'premier', 'laliga', 'seriea-ita', 'libertadores', 'sudamericana', 
    'ucl', 'uel', 'ueconf', 'brasileirao', 'brasileirao-b', 'copadobrasil'
];

leagues.forEach(league => {
    // Standings/Table endpoint
    app.get(`/api/sports/${league}-tabela`, (req, res) => {
        res.json({ standings: generateMockStandings(league) });
    });
    
    // Top scorers endpoint
    app.get(`/api/sports/${league}-artilheiros`, (req, res) => {
        res.json({ scorers: generateMockScorers(league) });
    });
    
    // Upcoming matches endpoint
    app.get(`/api/sports/${league}-proximos`, (req, res) => {
        res.json({ matches: generateMockMatches(league) });
    });
});

// Legacy endpoints (maintaining backwards compatibility)
app.get('/api/featured-matches', (req, res) => {
    res.json({
        matches: [
            { date: '2025-11-01', match: 'Flamengo vs Fluminense', probabilities: { Flamengo: 45, Empate: 28, Fluminense: 27 } },
            { date: '2025-11-01', match: 'Palmeiras vs Corinthians', probabilities: { Palmeiras: 52, Empate: 25, Corinthians: 23 } },
            { date: '2025-11-02', match: 'São Paulo vs Santos', probabilities: { 'São Paulo': 48, Empate: 30, Santos: 22 } }
        ]
    });
});

app.post('/api/auth', (req, res) => {
    const { name, email, idToken } = req.body;
    
    // Mock authentication
    const userId = 'user_' + Date.now();
    res.json({
        userId: userId,
        name: name || 'Analista Pro',
        email: email || 'analista@example.com',
        photoURL: 'https://via.placeholder.com/40'
    });
});

app.get('/api/coins', (req, res) => {
    const userId = req.query.userId;
    // Mock: return some coins
    res.json({ coins: 500 });
});

app.post('/api/coins', (req, res) => {
    const { userId, coins } = req.body;
    // Mock: just acknowledge
    res.json({ success: true, coins: coins });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🏆 Example endpoint: http://localhost:${PORT}/api/sports/premier-tabela`);
});
