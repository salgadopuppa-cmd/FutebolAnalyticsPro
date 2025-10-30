#!/usr/bin/env bash
set -euo pipefail

# Simple helper to run seed -> tests -> cleanup locally or in CI
BASE=${BASE:-http://localhost:3000}

echo "Seeding test data at $BASE..."
curl -s -X POST "$BASE/api/test/seed" || true

echo "Running E2E tests..."
npm test
TEST_STATUS=$?

echo "Cleaning up test data..."
curl -s -X POST "$BASE/api/test/cleanup" || true

exit $TEST_STATUS
