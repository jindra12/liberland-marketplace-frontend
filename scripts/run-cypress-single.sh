#!/usr/bin/env bash
set -euo pipefail

lock_file="${TMPDIR:-/tmp}/liberland-marketplace-frontend-cypress.lock"
electron_launch_args="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer"
artifact_dir="cypress/artifacts"

rm -rf "$artifact_dir"

if [ -n "${ELECTRON_EXTRA_LAUNCH_ARGS:-}" ]; then
    export ELECTRON_EXTRA_LAUNCH_ARGS="${ELECTRON_EXTRA_LAUNCH_ARGS} ${electron_launch_args}"
else
    export ELECTRON_EXTRA_LAUNCH_ARGS="${electron_launch_args}"
fi

exec 9>"$lock_file"
if ! flock -n 9; then
    echo "Another Cypress instance is already running." >&2
    exit 1
fi

exec cypress run "$@"
