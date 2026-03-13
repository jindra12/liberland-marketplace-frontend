# Codex Workspace Instructions

## Notifications
- Before any command that requests elevated permissions, send a desktop notification first.
- When a task is complete, send a desktop notification before the final user-facing response.
- Prefer the helper script at `scripts/codex-notify.sh`.
- Use `Codex` as the notification title unless a more specific title is helpful.
- If desktop notifications are temporarily unavailable, continue the task and mention that notification delivery failed.

## Notification Messages
- Permission request: clearly say that Codex needs approval and summarize the action.
- Task completion: clearly say that the requested work is done.
- Read CLAUDE.md in the same folder for further instructions