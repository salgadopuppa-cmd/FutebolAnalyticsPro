E2E tests for Futebol Analytics Pro

Prerequisites
- Node.js installed (14+)
- The mock server running at http://localhost:3000 (run `server\start.ps1`)

Install and run tests

1. Open PowerShell in this project root and install e2e dependencies:

```powershell
cd .\e2e
npm install
```

2. Run the test (will run headless Chromium):

```powershell
npm test
```

Notes
- The test uses the fallback sign-in flow (the server-side email fallback) so it does not require Firebase to be configured.
- If the test fails to extract `userId` from the debug panel, backend verification is skipped but UI actions are still performed.

CI helper
---------
You can use the helper script to run seed → tests → cleanup in one command.

On Linux/macOS/WSL (or in CI):

```bash
cd e2e
./ci-prepare.sh
```

The script will attempt to call `/api/test/seed` before running tests and `/api/test/cleanup` after.
