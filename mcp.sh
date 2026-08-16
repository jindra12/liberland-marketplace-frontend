#!/usr/bin/env bash

set -euo pipefail

npx @openai/codex mcp remove nswap-backend 2>/dev/null || true
npx @openai/codex mcp add nswap-backend \
  --url 'https://nswap.io/api/mcp?auth=required&serverUrl=https%3A%2F%2Fbackend.nswap.io'
npx @openai/codex mcp login nswap-backend
npx @openai/codex mcp get nswap-backend
npx @openai/codex mcp list
