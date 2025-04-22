#!/bin/bash

TARGET="auth/server.js"
TMP="auth/server.fixed.js"

awk '
/app.use\(\/auth/ { use = $0; next }
/app.listen/ && !done {
  print use;
  done = 1
}
{ print }
' "$TARGET" > "$TMP" && mv "$TMP" "$TARGET"

docker compose restart auth
