FutebolAnalyticsPro - Ranking & Minigames: Run and Test

Quick start (Windows PowerShell):

1. Install dependencies (first time):

   npm install

2. Start the server:

   npm run start

   The server will listen on http://localhost:4173

3. Test the ranking endpoint (PowerShell):

   $body = @{ game='precisao'; nome='Tester'; pontos=42 } | ConvertTo-Json
   Invoke-RestMethod -Method Post -Uri http://localhost:4173/api/ranking -ContentType 'application/json' -Body $body

   Invoke-RestMethod -Method Get -Uri "http://localhost:4173/api/ranking?game=precisao&limit=10"

Or using curl (cross-platform):

   curl -X POST http://localhost:4173/api/ranking -H "Content-Type: application/json" -d '{"game":"precisao","nome":"Tester","pontos":42}'
   curl "http://localhost:4173/api/ranking?game=precisao&limit=10"

Notes:
- Ranking persistence uses SQLite stored at server/data/app.db
- The route exposes POST /api/ranking and GET /api/ranking
- Limit and game query params supported. When no game is provided, an aggregated leaderboard is returned (sum of pontos per nome)
- Ensure Node modules are installed (sqlite3 is required)

Security:
- This implementation uses a simple rate limiter for POSTs. For production, add authentication, input sanitization, and stricter rate-limits.

Next steps recommended:
- Add server-side validation and optional user_id to tie scores to authenticated users
- Add leaderboard caching and indexes for large datasets
- Add PR hooks and backup scripts for the SQLite file
