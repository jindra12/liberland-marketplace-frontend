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
- Do not use `.trim()` unless it adds clear, necessary value to the behavior
- Do not use the `void` operator to suppress async calls. Call the function directly, pass the async handler through, or `await` it when the flow depends on completion.
- Use `Skeleton` for page-level loading states and `Spin` for localized/action loading states.
- In browser-only frontend code, do not add `typeof window` or similar environment guards unless there is a concrete SSR/build-time requirement already present in the repo.
- Do not add `.catch()` blocks to promises unless the user explicitly asks for that handling style or the behavior clearly requires local error handling.
- Do not swallow exceptions in `catch` blocks unless there is a clear reason. If you handle an error locally, log it with `console.error` unless that would be redundant for a justified reason.
- Prefer `async`/`await` over `.then(...)` chains. If an async callback cannot be awaited at the call site, use an internal `async` function with local `try`/`catch` rather than promise chaining.
- Never hand-write local module declarations for third-party packages until you have checked whether the package ships its own types or has an `@types/*` package. Prefer the published types over local `.d.ts` shims.
- Prefer the simplest typed implementation over speculative abstraction. If TypeScript can describe the shape, do not add defensive `typeof`/object checks, bridge layers, custom plugins, or indirection "just in case".
- When payloads are produced entirely inside this app, type them from the real call sites. Do not use broad `unknown`/`Record<string, unknown>` payload models unless the data is genuinely dynamic.
- Keep analytics and routing code especially small. For page tracking, prefer a tiny `useLocation`-driven effect unless there is a concrete, unavoidable requirement that truly needs more structure.
- Stateless utilities belong to `utils.ts/x`.
- Constants belong to `constants.ts/x`.
- Types belong to `types.ts`.
- Use one component per file by default. If a component family needs to stay together, put those component files in a single CamelCase folder.
- Never use the `function` keyword for React components. Use `export const Component: React.FunctionComponent<ComponentProps> = (props) => {}`. If a component has no props, use `export const Component: React.FunctionComponent = () => {}`.
- Do not add compatibility shim files, fallback re-export files, or similar workaround files when the correct fix is to update imports or references directly.
