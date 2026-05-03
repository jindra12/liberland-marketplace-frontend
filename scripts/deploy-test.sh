#!/usr/bin/env bash
set -euo pipefail

set -a
. ./dev.env
set +a

./node_modules/.bin/vercel build
exec ./node_modules/.bin/vercel deploy --prebuilt --target=preview --yes
