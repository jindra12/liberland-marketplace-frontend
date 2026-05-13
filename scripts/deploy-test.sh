#!/usr/bin/env bash
set -euo pipefail

set -a
. ./dev.env
set +a

TEST_ALIAS="${TEST_ALIAS:-nswap-test.vercel.app}"
DEPLOY_OUTPUT="$(./node_modules/.bin/vercel deploy --yes)"
DEPLOY_URL="$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[^[:space:]]+' | tail -n1)"

./node_modules/.bin/vercel alias set "$DEPLOY_URL" "$TEST_ALIAS"

printf '%s\n' "$DEPLOY_OUTPUT"
printf 'Deployment URL: %s\n' "$DEPLOY_URL"
printf 'Alias URL: https://%s\n' "$TEST_ALIAS"
printf 'OIDC callback: https://%s/auth/callback\n' "$TEST_ALIAS"
