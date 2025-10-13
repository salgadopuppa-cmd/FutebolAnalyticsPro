## Summary

Describe the change and why it is needed.

## Changes
- (bullet list of important changes)

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

---

If applicable, also include:

- Deployment notes (how to promote to staging/production).
- Any follow-ups or TODOs left after this PR.
