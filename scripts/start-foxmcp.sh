#!/usr/bin/env bash
set -euo pipefail

FOX_MCP_DIR="${FOX_MCP_DIR:-/tmp/foxmcp}"
FOX_MCP_PYTHON="$FOX_MCP_DIR/venv/bin/python"
FOX_MCP_SERVER="$FOX_MCP_DIR/server/server.py"

if [ ! -x "$FOX_MCP_PYTHON" ]; then
  echo "FoxMCP virtualenv not found at: $FOX_MCP_PYTHON" >&2
  echo "Run the FoxMCP install step first, then try again." >&2
  exit 1
fi

if [ ! -f "$FOX_MCP_SERVER" ]; then
  echo "FoxMCP server not found at: $FOX_MCP_SERVER" >&2
  exit 1
fi

exec "$FOX_MCP_PYTHON" "$FOX_MCP_SERVER"
