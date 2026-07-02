#!/usr/bin/env bash
# Capture Brieff case-study screenshots (2x retina) from the running dev server.
# Usage: start the app (npm run dev), then: PORT=3007 bash scripts/shots.sh
# Override OUT to capture into a different version folder.
set -e
CHROME=${CHROME:-/home/adrianama/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome}
PORT=${PORT:-3000}
OUT=${OUT:-"$(cd "$(dirname "$0")/.." && pwd)/case-study/screens/v3-brieff"}
mkdir -p "$OUT"

shot () { # name  window  path
  "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --force-device-scale-factor=2 --virtual-time-budget=4000 --window-size="$2" \
    --screenshot="$OUT/$1" "http://localhost:$PORT/$3" >/dev/null 2>&1
}

shot "home.png"        "1440,940"  ""                  # workspace home / today
shot "prep.png"        "1440,1180" "prep"              # pre-call prep brief
shot "recap-empty.png" "1440,900"  "recap"             # recap, start / empty state
shot "recap-full.png"  "1440,1320" "recap?demo=done"   # recap, full generated
shot "recap-sent.png"  "1440,1200" "recap?demo=sent"   # recap, success + time saved

echo "Saved to $OUT"
ls -la "$OUT"
