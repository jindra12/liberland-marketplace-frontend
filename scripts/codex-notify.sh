#!/usr/bin/env bash

set -euo pipefail

TITLE="${1:-Codex}"
MESSAGE="${2:-Notification}"
URGENCY="${3:-normal}"

notify-send --urgency="$URGENCY" "$TITLE" "$MESSAGE"
