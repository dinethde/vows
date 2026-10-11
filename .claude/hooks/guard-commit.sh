#!/usr/bin/env bash
# PreToolUse on Bash. Catches attribution before the commit-msg hook has to.
set -euo pipefail
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')
case "$CMD" in
  *git\ commit*)
    if printf '%s' "$CMD" | grep -qiE 'co-authored-by|generated with|🤖'; then
      echo "No tool attribution in commit messages. See .claude/skills/writing-commits." >&2
      exit 2
    fi ;;
  *git\ push*--force\ *|*git\ push\ -f*)
    echo "Use --force-with-lease, never a plain force push." >&2
    exit 2 ;;
esac
exit 0
