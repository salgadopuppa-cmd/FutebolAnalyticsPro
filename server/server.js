const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const apiFootballRouter = require('./api-football-proxy'); 
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); 
app.use(express.json());
app.use('/api/sports', apiFootballRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.post('/api/auth', (req, res) => res.json({ userId: 'user_' + Date.now(), name: req.body.name || 'Analista Pro', email: req.body.email || 'analista@example.com', photoURL: 'https://via.placeholder.com/40' }));
app.get('/api/coins', (req, res) => res.json({ coins: 500 }));
app.post('/api/coins', (req, res) => res.json({ success: true, coins: req.body.coins }));
const staticPath = path.join(__dirname, '..');
app.use(express.static(staticPath));
app.get('/app', (req, res) => res.sendFile(path.join(staticPath, 'app.html')));
app.get('/', (req, res) => res.sendFile(path.join(staticPath, 'index.html')));
app.listen(PORT, () => {
    console.log(`?? Real API Server running on http://localhost:${PORT}`);
    if (!process.env.API_FOOTBALL_KEY) {
        console.warn('====================================================\nWARNING: API_FOOTBALL_KEY is not set in server/.env\nData endpoints will fail until this is fixed.\n====================================================');
    } else {
         console.log('? API_FOOTBALL_KEY loaded successfully.');
    }
});
