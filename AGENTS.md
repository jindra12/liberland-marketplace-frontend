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

## Code Hygiene
- Do not use `.trim()` unless it adds clear, necessary value to the behavior.
- If a `trim()` call is not materially required, do not add it.
- Do not use the `void` operator to silence promises. Prefer explicit promise handling or plain calls.
- Do not add `.catch()` blocks to promises unless the user explicitly asks for that handling style or the behavior clearly requires local error handling.
- Use one component per file by default. If a component family needs to stay together, put those component files in a single CamelCase folder.
- Do not add compatibility shim files, fallback re-export files, or similar workaround files when the correct fix is to update imports or references directly.
