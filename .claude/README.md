# .claude

What loads, and when — the short version of chapter 28 of `architecture.md`.

| Path                     | Loads                                                                        |
| ------------------------ | ---------------------------------------------------------------------------- |
| `settings.json`          | Only from the directory the session started in. Start at the repository root |
| `settings.local.json`    | Same, and gitignored. Personal overrides only                                |
| `rules/*.md`             | Every session, or when a file matching its `paths` front matter is touched   |
| `skills/<name>/SKILL.md` | On demand, when the task matches the description                             |
| `agents/*.md`            | When work is delegated                                                       |
| `commands/*.md`          | When typed as a slash command                                                |
| `hooks/*.sh`             | Wired in `settings.json`, around tool calls                                  |

**The trap:** a `settings.json` inside `apps/web/.claude/` never loads, because
nobody starts a session there and in a worktree it could not apply anyway.
Per-app `.claude` directories hold **skills and nothing else**.

The hook shapes in `settings.json` follow the Claude Code settings schema. If a
hook silently stops firing after an upgrade, check the schema before assuming
the script is broken.
