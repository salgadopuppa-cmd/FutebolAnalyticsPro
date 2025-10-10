Mock API server for Futebol Analytics Pro

How to run:

1. Open a terminal in the project folder `FutebolAnalyticsPro/server`.
2. Install dependencies:

   npm install

3. Start the mock server:

   npm start

The server will run on http://localhost:3000 and will also serve the frontend (index.html) from the parent folder.

Endpoints:
- POST /api/auth -> creates a mock user, returns { userId, name, email, photoURL }
- GET /api/coins?userId=... -> returns { userId, coins }
- POST /api/coins { userId, coins } -> saves coins and returns { userId, coins }
- GET /api/featured-matches -> returns { matches: [...] }

Notes:
- This is a development mock server. For production replace with real auth and persistent storage.

Optional: Firebase Admin (verify ID tokens)
--------------------------------------------------
If you want to enable Firebase ID token verification on the server (recommended when integrating real Firebase Auth on the frontend), provide a service account JSON and set the environment variable before starting the server:

On Windows PowerShell:

   $env:FIREBASE_SERVICE_ACCOUNT_PATH = 'C:\path\to\serviceAccountKey.json'
   npm start

When provided the server will try to verify `idToken` sent to `POST /api/auth` and will use the decoded token email/uid to find or create the user record.

If not provided the server falls back to a simple email-based create/find behavior (development mode).
