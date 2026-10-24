#!/usr/bin/env bash
# PostToolUse. Formats the file that was just written. Never fails the turn.
set -uo pipefail
INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
[ -z "$FILE" ] && exit 0
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    command -v pnpm >/dev/null 2>&1 && pnpm exec prettier --write "$FILE" >/dev/null 2>&1 || true ;;
esac
exit 0
