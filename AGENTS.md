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

## Repository Overview

Liberland Marketplace Frontend is a React 18 app that connects users to syndicated free
marketplaces. It is built with Create React App, react-app-rewired, TypeScript, Ant Design,
GraphQL, and Tailwind-adjacent SCSS styling. The project is frontend-only and the package
manager is `yarn`.

## Commands

- Use `yarn` for package management and scripts.
- `yarn dev` starts the dev server.
- `yarn build` creates a production build.
- `yarn start` runs the built app.
- `yarn test` runs the Jest/Testing Library suite.
- `yarn test:ct` runs Playwright component tests.
- `yarn playground` opens the browser playground test.
- `yarn codegen` regenerates GraphQL hooks and types from `.graphql` files.
- `yarn lint` and `yarn lint:fix` run ESLint.

## Architecture

- GraphQL queries live in `src/queries/` and feed generated hooks in `src/generated/graphql.ts`.
- `src/gqlFetcher.ts` is the shared GraphQL fetcher.
- Components generally follow a three-layer pattern per entity: wrapper, list, and detail.
- Search components live in `src/components/search/` and use shared autosuggest helpers.
- Card components live in `src/components/cards/` and are reused across home, detail, and search surfaces.
- React Router v7 defines lazy-loaded entity routes in `App.tsx`.
- Ant Design controls most UI, with SCSS modules in `src/styles/` for custom styling.
- Node polyfills in `config-overrides.js` support the wallet libraries.

## Key Files

- `src/gqlFetcher.ts` — axios-based GraphQL fetcher.
- `src/generated/graphql.ts` — generated hooks and types, do not edit manually.
- `src/components/AppList.tsx` — reusable infinite scroll list.
- `src/components/Loader.tsx` — loading and error wrapper.
- `src/components/cards/` — shared card components.
- `codegen.ts` — GraphQL code generation config.
- `config-overrides.js` — webpack polyfills.

## Conventions

- Use Ant Design components plus SCSS, not inline styles.
- Keep component file structure small and singular-purpose.
- TypeScript strict mode is enabled.
- When adding or changing queries, run `yarn codegen`.
- Startup naming stays internal; user-facing strings use Venture naming.

## Playwright

- Use Playwright proactively for frontend behavior changes.
- Check the dev server on `localhost:3001`, start it if needed, then verify the affected page.
- Use the shared test credentials from the repo context when login is required.
- Re-test and fix any issues you find.
- Delete any screenshots generated during test runs.

## Code Hygiene

- Do not use `.trim()` unless it adds clear, necessary value to the behavior
- Never use `==` or `!=`. Use `===`, `!==`, `??`, or explicit `value === null || value === undefined` checks.
- Do not use `for...of`. Use array methods like `map`, `reduce`, `find`, `some`, and `every` instead.
- Do not add new `.js` or `.mjs` files, or `.js`/`.mjs` import paths, unless it is absolutely necessary. Prefer TypeScript files and TypeScript-native imports for new code.
- Do not add `.ts` or `.tsx` extensions to local import paths. Prefer extensionless internal imports unless a file truly needs an explicit extension for runtime resolution.
- Never add `// @ts-nocheck` to a TypeScript file. Fix the types or split the code until the file typechecks.
- Do not use `unknown` as a lazy stand-in for helper inputs when the data can be expressed as a concrete JSON-ish union or domain type.
- In tests, do not use `unknown` for request bodies, fixtures, window mocks, or handler inputs. Use concrete test payload types, `JsonValue`, or small named interfaces instead.
- Do not use `|| undefined` to coerce values. If a value can really be `null`, reflect that in the type. If a prop specifically needs `undefined`, use an explicit `!value ? undefined : value` check instead.
- Do not use `?? undefined`. If a value can be absent, model it as `null` in the type or use a deliberate `!` assertion when the contract guarantees it.
- Do not use the `void` operator to suppress async calls. Call the function directly, pass the async handler through, or `await` it when the flow depends on completion.
- Use `Skeleton` for page-level loading states and `Spin` for localized/action loading states.
- In browser-only frontend code, do not add `typeof window` or similar environment guards unless there is a concrete SSR/build-time requirement already present in the repo.
- Do not add `.catch()` blocks to promises unless the user explicitly asks for that handling style or the behavior clearly requires local error handling.
- Do not swallow exceptions in `catch` blocks unless there is a clear reason. If you handle an error locally, log it with `console.error` unless that would be redundant for a justified reason.
- Prefer `async`/`await` over `.then(...)` chains. If an async callback cannot be awaited at the call site, use an internal `async` function with local `try`/`catch` rather than promise chaining.
- Do not use `React.useCallback` or `useCallback` unless it is absolutely necessary for correctness or there is a demonstrated performance need. Stable handlers are not a default requirement.
- Never use `useEffect` defensively. Do not mirror props, query data, or other derived values into local state with an effect just to "keep them in sync". Derive the value directly or update state at the actual event source instead.
- Do not use remount keys to reset forms or child state. If a stateful library such as Ant Form needs to reflect changed inputs, update it explicitly with its own setter API instead of forcing an unmount/remount cycle.
- Prefer existing utility hooks already in the repo, such as `usehooks-ts`, over hand-rolled timer/effect plumbing for things like `setTimeout`.
- Do not duplicate defensive invariant checks in child components when a parent component already guarantees the contract. Trust validated props and parent-owned form constraints instead of re-checking values like `quantity <= 0` in leaf UI components.
- Do not add impossible-state guards when the surrounding UI flow already prevents that state. If a screen, button state, or parent guard guarantees the condition, trust it instead of adding extra branches like empty-cart submit checks.
- Never hand-write local module declarations for third-party packages until you have checked whether the package ships its own types or has an `@types/*` package. Prefer the published types over local `.d.ts` shims.
- Prefer the simplest typed implementation over speculative abstraction. If TypeScript can describe the shape, do not add defensive `typeof`/object checks, bridge layers, custom plugins, or indirection "just in case".
- When payloads are produced entirely inside this app, type them from the real call sites. Do not use broad `unknown`/`Record<string, unknown>` payload models unless the data is genuinely dynamic.
- If the user asks for a behavior or workflow, implement it directly in the default path instead of hiding it behind a config toggle, feature flag, or environment variable unless the user explicitly asked for an optional mode.
- Only do what the user explicitly asked for. Do not add extra behavior, side effects, refactors, or "improvements" unless they were requested too. If an existing rule already covers the request, restate or adapt that rule instead of inventing a new approach that changes the task.
- Keep analytics and routing code especially small. For page tracking, prefer a tiny `useLocation`-driven effect unless there is a concrete, unavoidable requirement that truly needs more structure.
- If a user asks you to fix a failing test, keep running the relevant test until it passes or you have a concrete app bug to report back.
- Stateless utilities belong to `utils.ts/x`.
- Constants belong to `constants.ts/x`.
- Types belong to `types.ts`.
- When a component stops being small and readable, split it into a component family folder and move stateless helpers out of the component file into `utils.ts/x`.
- A component should have exactly one purpose. If a component starts coordinating multiple concerns or multiple chain integrations, split it into smaller focused components instead of branching inside one file.
- Avoid components with more than 2 hooks. If a component needs a third hook, stop and split the behavior into smaller components or an observer/helper component.
- Never destructure props. Always accept a single `props` parameter and read values directly from `props.foo`.
- Do not introduce useless local constants that only rename an existing value. If a value is just `props.foo`, use `props.foo` directly instead of mirroring it into `const foo = props.foo`.
- Use one component per file by default. If a component family needs to stay together, put those component files in a single CamelCase folder.
- Never use the `function` keyword for React components. Use `export const Component: React.FunctionComponent<ComponentProps> = (props) => {}`. If a component has no props, use `export const Component: React.FunctionComponent = () => {}`.
- Do not add compatibility shim files, fallback re-export files, or similar workaround files when the correct fix is to update imports or references directly.
- Do not edit `src/components/hooks.ts` unless the user explicitly asks for changes there.
- Do not edit `deepMergeConcatArrays` in `src/components/query/utils.ts` unless the user explicitly asks for changes there.
- Do not touch the backend repo or backend files from this frontend workspace unless the user explicitly asks for backend changes.
