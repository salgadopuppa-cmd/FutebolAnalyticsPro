# E2E/CI: Playwright multi-browser tests + seed endpoints

## Summary
- Adds Playwright E2E tests (Chromium / Firefox / WebKit).
- Adds server test endpoints (seed / cleanup) guarded by `ALLOW_TEST_ENDPOINTS=true`.
- Adds GitHub Actions workflow `.github/workflows/e2e.yml` to run tests in a matrix across browsers, upload artifacts (server logs, screenshots) and optionally use a Firebase service account provided via secret.
- Includes helper scripts and a local run report `reports/e2e-run-report-2025-10-09.md`.

## Files of interest
- `e2e/test-e2e.js` — Playwright test script.
- `e2e/package.json` — E2E dev deps (Playwright, node-fetch).
- `server/index.js` — Mock API server, SQLite persistence, optional Firebase verification, and test endpoints when `ALLOW_TEST_ENDPOINTS=true`.
- `.github/workflows/e2e.yml` — CI workflow to run the matrix of browsers and upload artifacts.
- `e2e/ci-prepare.sh` — helper to seed → test → cleanup for CI or local use.

## How to validate locally
1. Start the server with test endpoints enabled:
```powershell
$env:ALLOW_TEST_ENDPOINTS='true'
Set-Location 'C:\Users\unik2\Downloads\FutebolAnalyticsPro'
.\start.ps1
```

2. In another terminal, run the E2E tests:
```powershell
cd e2e
npm ci
npm test
```

3. On failure, screenshots are saved as `e2e/failure-<browser>.png` and server logs in `server/server_run.log`.

## CI notes
- To enable Firebase verification in CI, add a repository secret named `FIREBASE_SERVICE_ACCOUNT_JSON` containing the service account JSON. The workflow writes it to `server/firebase-service-account.json` and sets `FIREBASE_SERVICE_ACCOUNT_PATH` in the job.
- Test endpoints are only enabled when `ALLOW_TEST_ENDPOINTS=true` to avoid accidental exposure.

## Security & cleanup
- Do not add real service-account JSONs in code. Use GitHub secrets for CI.
- After validation, unset `ALLOW_TEST_ENDPOINTS` in any shared environment.

## Run report
See `reports/e2e-run-report-2025-10-09.md` for the summary of a local run executed during development.

---
If you want, I can also create a PR template or add reviewers automatically after you push — tell me when you've pushed the branch and I will continue.
