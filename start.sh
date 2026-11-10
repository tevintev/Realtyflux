#!/bin/bash
# Starts the Next.js production server in the background on a free port.
# Usage: ./start.sh [port]   optional fixed port; otherwise a free port is chosen.
set -e
cd "$(dirname "$0")"

LOG="site.log"

requested="${1:-}"
if [ -n "$requested" ]; then
  if ss -ltn | awk '{print $4}' | grep -Eq "[:.]$requested$"; then
    echo "Port $requested is already in use." >&2
    exit 1
  fi
  PORT="$requested"
else
  PORT=""
  for ((p = 3001; p <= 65535; p++)); do
    if ! ss -ltn | awk '{print $4}' | grep -Eq "[:.]$p$"; then
      PORT="$p"
      break
    fi
  done
  [ -n "$PORT" ] || { echo "No free port found." >&2; exit 1; }
fi

if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
  echo "No production build found; running next build ..."
  npm run build
fi

nohup npm run start -- -p "$PORT" > "$LOG" 2>&1 &
PID=$!

sleep 2
if kill -0 "$PID" 2>/dev/null; then
  echo "Site started in the background on port $PORT (PID $PID)"
  echo "Log file: $(pwd)/$LOG"
else
  echo "Failed to start the site. Check $(pwd)/$LOG" >&2
  cat "$LOG"
  exit 1
fi