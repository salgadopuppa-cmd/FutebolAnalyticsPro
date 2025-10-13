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

## Reviewer checklist
Please use the following checklist when reviewing this PR. Mark items as you verify them.

- [ ] CI: branch pushed and GitHub Actions triggered for `.github/workflows/e2e.yml` and `.github/workflows/ci-deploy.yml`.
- [ ] Tests: Playwright E2E run in the matrix (Chromium/Firefox/WebKit) without unexpected failures; artifacts (screenshots, traces) are uploaded on failure.
- [ ] Unit tests: `server/tests` (Jest + Supertest) run and pass in CI.
- [ ] Test endpoints: verify `ALLOW_TEST_ENDPOINTS=true` gating prevents test-only endpoints from being active in production runs.
- [ ] Secrets: confirm `FIREBASE_SERVICE_ACCOUNT_JSON` (if used) is provided as a GitHub secret and is not committed to the repo.
- [ ] DB: confirm `server/data/fap.db` is not tracked in Git and `.gitignore` includes `server/data`/`*.db` as appropriate.
- [ ] Security: verify Helmet is present, CORS is appropriately restricted in `server/index.js`, and request logging redacts sensitive fields.
- [ ] Container: confirm Docker image builds (see `Dockerfile`) and `docker-compose up` runs locally (TLS certs are placeholders and should be replaced for production).
- [ ] Scanning: Trivy/CodeQL jobs ran and returned results; high/critical findings are triaged and documented in the PR conversation.
- [ ] Artifacts: server logs and test artifacts are attached to failing CI jobs for debugging.
- [ ] Docs: README and E2E run report are sufficient to reproduce locally; instructions are clear for running `start-ci` and E2E tests.

If you'd like, I can (a) add an automated checklist to the PR template, (b) add reviewers automatically on push, or (c) update workflows to include an integration test that runs against the built container image — tell me which and I'll implement it.
