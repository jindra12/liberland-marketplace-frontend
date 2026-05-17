#!/usr/bin/env bash
set -euo pipefail

had_env=0
had_dev_env=0

restore_envs() {
    if [ "$had_dev_env" -eq 1 ] && [ -e .env ]; then
        mv .env dev.env
    fi

    if [ "$had_env" -eq 1 ] && [ -e temp.env ]; then
        mv temp.env .env
    fi
}

trap restore_envs EXIT INT TERM

if [ -e .env ]; then
    mv .env temp.env
    had_env=1
fi

if [ -e dev.env ]; then
    mv dev.env .env
    had_dev_env=1
fi

TEST_ALIAS="${TEST_ALIAS:-nswap-test.vercel.app}"
yarn build
./node_modules/.bin/vercel build --yes
DEPLOY_OUTPUT="$(./node_modules/.bin/vercel deploy --prebuilt --yes)"
DEPLOY_URL="$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[^[:space:]]+' | tail -n1)"

./node_modules/.bin/vercel alias set "$DEPLOY_URL" "$TEST_ALIAS"

printf '%s\n' "$DEPLOY_OUTPUT"
printf 'Deployment URL: %s\n' "$DEPLOY_URL"
printf 'Alias URL: https://%s\n' "$TEST_ALIAS"
printf 'OIDC callback: https://%s/auth/callback\n' "$TEST_ALIAS"
