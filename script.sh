#!/bin/bash

echo "🔍 Scanning Dockerfiles for Git conflict markers..."

# Find all Dockerfiles with conflicts
FILES=$(grep -rl '<<<<<<< HEAD' /opt/taifas/*/Dockerfile)

if [ -z "$FILES" ]; then
  echo "✅ No conflict markers found. You're all good!"
  exit 0
fi

for FILE in $FILES; do
  echo "🧹 Cleaning: $FILE"

  # Backup original just in case
  cp "$FILE" "$FILE.bak"

  # Remove conflict markers and keep only HEAD version
  awk '
    BEGIN { skip=0 }
    /^<<<<<<< HEAD$/ { skip=1; next }
    /^=======$/ { skip=0; next }
    /^>>>>>>>/ { next }
    skip == 0 { print }
  ' "$FILE.bak" > "$FILE"

  echo "✅ Cleaned: $FILE (backup saved as $FILE.bak)"
done

echo "🎉 All Dockerfiles cleaned up!"
