#!/usr/bin/env bash
set -euo pipefail

specs=()
while IFS= read -r spec; do
    specs+=("$spec")
done < <(find cypress/component -maxdepth 1 -name '*.cy.tsx' | sort)

if [ "${#specs[@]}" -eq 0 ]; then
    echo "No Cypress component specs found." >&2
    exit 1
fi

shards=4
declare -a shard_specs=("" "" "" "")

for index in "${!specs[@]}"; do
    shard_index=$((index % shards))
    if [ -z "${shard_specs[$shard_index]}" ]; then
        shard_specs[$shard_index]="${specs[$index]}"
    else
        shard_specs[$shard_index]="${shard_specs[$shard_index]},${specs[$index]}"
    fi
done

declare -a shard_pids=()
declare -a shard_statuses=()

for shard_index in 0 1 2 3; do
    if [ -z "${shard_specs[$shard_index]}" ]; then
        continue
    fi

    (
        CYPRESS_SKIP_ARTIFACT_CLEANUP=1 CYPRESS_DISABLE_RUN_LOCK=1 ./scripts/run-cypress-single.sh --component --browser chrome --spec "${shard_specs[$shard_index]}"
    ) &
    shard_pids+=("$!")
done

for pid in "${shard_pids[@]}"; do
    if wait "$pid"; then
        shard_statuses+=(0)
    else
        shard_statuses+=($?)
    fi
done

for status in "${shard_statuses[@]}"; do
    if [ "$status" -ne 0 ]; then
        exit "$status"
    fi
done
