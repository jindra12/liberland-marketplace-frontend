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
- When the user says "tests", they mean Cypress tests. Do not reach for Jest unless the user explicitly asks for Jest.
- To verify Cypress tests, actually run them instead of only typechecking or inspecting files.
- When the user asks for a test, treat that as a Cypress component test. Do not switch to Jest unless the user explicitly asks for Jest or another runner.
- When testing, prefer the smallest relevant targeted test or spec instead of broad suite reruns unless the user explicitly asks for wider coverage.
- Never start a new Cypress run until you have confirmed the previous Cypress process is fully stopped.
- The only allowed way to run Cypress is through `yarn cypress:run`, which must use the repo lock wrapper. Do not invoke `cypress run` directly from package scripts or ad hoc commands.
- Never use `cy.wait(number)` in Cypress tests or helpers. Use alias-based waits, visible state assertions, or explicit network events instead.
- If Cypress/Electron crashes or hangs inside the sandbox, rerun the suite outside the sandbox with elevated permissions instead of looping on the same sandboxed run.
- For any Cypress run that matters, prefer the outside-sandbox elevated path from the start; if it fails, retry once outside the sandbox after fixing the blocker instead of repeating sandboxed attempts.
- Every Cypress `describe()` should live in its own file so it can be run independently, and every new Cypress file should get matching headed and unheaded `package.json` scripts.
- Always run a linter before finishing code changes, and always check for compile and lint errors before reporting completion.
- After any Cypress run that produces screenshots, always inspect the screenshots yourself before claiming success. Ask first: "Do the screenshots actually show the intended UI state?"
- If a single test run exceeds 5 minutes, stop it and diagnose or split it instead of waiting longer.
- If a single Cypress spec appears to need anything close to 40 minutes, assume something is wrong and investigate rather than letting it run.
- Never use native HTML tags when Ant Design provides an equivalent component; prefer library components over native ones.
- Before any Cypress run or analysis that may clean up `cypress/artifacts`, first copy the relevant screenshots, videos, and reports to a safe `/tmp` location so the run data is not lost.
- For small layout-only wrappers, prefer Ant Design `Flex` or `Space` instead of custom wrapper `div`s and CSS spacing shims.
- Route components should stay as thin entry files. If a route file needs `export default` for Next/lazy-loading compatibility, keep it there and add a local ESLint override for `import/no-default-export` in that file instead of changing the global rule.
- For route components, split the actual UI into one component per file and move shared literals into `constants.ts` or `utils.ts` so the route file only wires the pieces together.
- If browser automation debugging is in play and FoxMCP is relevant, remind the user to start FoxMCP before troubleshooting the browser session.
- Do not create lots of tiny files for one feature; keep related code grouped and split files only when a module is getting large, ideally around 300 lines.
- `yarn codegen` regenerates GraphQL hooks and types from `.graphql` files.
- `yarn codegen` requires the sibling backend dev server in `../liberland-marketplace` to be running on port `3001`; start it first and shut it down after codegen finishes.
- When Codex is told to run codegen, that includes starting the sibling backend repo at `../liberland-marketplace` on port `3001` first and shutting it down after codegen finishes.
- Never hand-edit `src/generated/graphql.ts`; always regenerate it with `yarn codegen` when GraphQL documents or schema change. If codegen fails, stop and report the problem instead of patching the generated file.
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

## Code Hygiene

- Do not use `.trim()` unless it adds clear, necessary value to the behavior
- Never use `==` or `!=`. Use `===`, `!==`, `??`, or explicit `value === null || value === undefined` checks.
- Do not write unnecessary `=== true` / `=== false` comparisons or `value === null || value === undefined` chains when a plain truthiness check or a simpler nullish guard is enough.
- Never use `Object.prototype` for anything whatsoever.
- Do not use `for...of`. Use array methods like `map`, `reduce`, `find`, `some`, and `every` instead.
- Do not add new `.js` or `.mjs` files, or `.js`/`.mjs` import paths, unless it is absolutely necessary. Prefer TypeScript files and TypeScript-native imports for new code.
- Do not add `.ts` or `.tsx` extensions to local import paths. Prefer extensionless internal imports unless a file truly needs an explicit extension for runtime resolution.
- Never add `// @ts-nocheck` to a TypeScript file. Fix the types or split the code until the file typechecks.
- Do not use `unknown` as a lazy stand-in for helper inputs when the data can be expressed as a concrete JSON-ish union or domain type.
- In tests, do not use `unknown` for request bodies, fixtures, window mocks, or handler inputs. Use concrete test payload types, `JsonValue`, or small named interfaces instead.
- Do not use `|| undefined` to coerce values. If a value can really be `null`, reflect that in the type. If a prop specifically needs `undefined`, use an explicit `!value ? undefined : value` check instead.
- Do not use `?? undefined`. If a value can be absent, model it as `null` in the type or use a deliberate `!` assertion when the contract guarantees it.
- Do not use `?? null` for any reason.
- Never use the `void` operator anywhere in app code, tests, or helpers.
- Do not use the `void` operator to suppress async calls. Call the function directly, pass the async handler through, or `await` it when the flow depends on completion.
- Never use `timeout: XXX` in Cypress tests or helpers to paper over a test failure. Add the missing assertion, wait for the real UI state, or fix the app behavior instead.
- Do not use inline `style={{ ... }}` props. Prefer SCSS classes or component props unless a one-off runtime value genuinely cannot be expressed otherwise.
- Do not thread simple local form fields through pass-through JSX props or render-slot props like `companyField`. Put the field JSX directly inside the owning component.
- Do not use `children` or `ReactNode` slots for simple form composition. If a shared form needs conditional fields, give it explicit boolean/data props and render the fields directly inside the shared component.
- Do not add `enabled` or `refetchOnMount` to creator/query hooks unless the query truly must wait on a separate prerequisite. If the component already owns the interaction, call the hook directly and scope it with `url:`.
- Do not define helper components inside another component file when they can stand on their own. If a field or subcomponent is reusable, put it in its own file instead of nesting it.
- Do not use bare `<img>` tags in UI code. Use Ant `Image` with `preview={false}` or `Avatar` instead.
- Use `Skeleton` for page-level loading states and `Spin` for localized/action loading states.
- In browser-only frontend code, do not add `typeof window` or similar environment guards unless there is a concrete SSR/build-time requirement already present in the repo.
- Do not add `.catch()` blocks to promises unless the user explicitly asks for that handling style or the behavior clearly requires local error handling.
- Do not swallow exceptions in `catch` blocks unless there is a clear reason. If you handle an error locally, log it with `console.error` unless that would be redundant for a justified reason.
- Prefer `async`/`await` over `.then(...)` chains. If an async callback cannot be awaited at the call site, use an internal `async` function with local `try`/`catch` rather than promise chaining.
- Do not access `window.localStorage` directly in app code. Use the repo's local-storage hook or a shared storage wrapper so storage access stays consistent and testable.
- Do not access `window.sessionStorage` directly in app code or tests. Use `useSessionStorage` instead.
- Do not use `window.dispatchEvent` for app state or feature signaling.
- When browser storage is needed in app code, use `window` as the target directly; do not thread alternate storage targets through production code.
- Do not use `window.history` for navigation or URL cleanup. Use `react-router-dom` navigation hooks inside router context, or `window.location.replace` when you are outside router context and must leave the page.
- Do not use `React.useCallback` or `useCallback` unless it is absolutely necessary for correctness or there is a demonstrated performance need. Stable handlers are not a default requirement.
- Never use `useEffect` defensively. Do not mirror props, query data, or other derived values into local state with an effect just to "keep them in sync". Derive the value directly or update state at the actual event source instead.
- Do not use remount keys to reset forms or child state. If a stateful library such as Ant Form needs to reflect changed inputs, update it explicitly with its own setter API instead of forcing an unmount/remount cycle.
- When using `useState`, prefer an atomic state type such as `string`, `number`, or `boolean`. Avoid object state unless you must update the whole object atomically, and do not rely on callback-style partial object merges inside `setState`.
- Prefer existing utility hooks already in the repo, such as `usehooks-ts`, over hand-rolled timer/effect plumbing for things like `setTimeout`.
- Do not duplicate defensive invariant checks in child components when a parent component already guarantees the contract. Trust validated props and parent-owned form constraints instead of re-checking values like `quantity <= 0` in leaf UI components.
- Do not add impossible-state guards when the surrounding UI flow already prevents that state. If a screen, button state, or parent guard guarantees the condition, trust it instead of adding extra branches like empty-cart submit checks.
- Never hand-write local module declarations for third-party packages until you have checked whether the package ships its own types or has an `@types/*` package. Prefer the published types over local `.d.ts` shims.
- Do not invent or import fake typing packages just to satisfy TypeScript. Use the package's published types, Cypress's built-in globals, or the repo's existing domain types instead of ad-hoc `declare module` shims or guessed imports.
- Prefer the simplest typed implementation over speculative abstraction. If TypeScript can describe the shape, do not add defensive `typeof`/object checks, bridge layers, custom plugins, or indirection "just in case".
- When the user asks you to add types to something, use the most concrete domain types the code can support. Do not satisfy the request with the broadest generic type that happens to compile.
- When payloads are produced entirely inside this app, type them from the real call sites. Do not use broad `unknown`/`Record<string, unknown>` payload models unless the data is genuinely dynamic.
- Never use `as never` as an acceptable type coercion. If the type is wrong, fix the type or the data shape instead of forcing it through `never`.
- If the user asks for a behavior or workflow, implement it directly in the default path instead of hiding it behind a config toggle, feature flag, or environment variable unless the user explicitly asked for an optional mode.
- Do not introduce boolean constants that are always `true` or `false`, and do not add CSS modifier classes for dead branches. Use the actual condition or remove the branch entirely.
- If you do not know how to solve a problem, or the fix is becoming speculative, stop and tell the user instead of guessing, making broad changes, or altering unrelated app code.
- Payment wallet preferences are advisory only. In Solana, Thirdweb, and Tron payment components, never block or hide payment solely because the connected wallet does not match `preferredWallet`; users must be able to complete payment with any connected wallet.
- If a component has three conditional branches for rendering or behavior, replace the chain with `switch` instead of a triple `if`; if the logic is getting bulky, split out a small component instead of piling more branches into one file.
- Only do what the user explicitly asked. Do not add extra behavior, side effects, refactors, or "improvements" unless they were requested too. If an existing rule already covers the request, restate or adapt that rule instead of inventing a new approach that changes the task.
- Never duplicate helper methods. If a helper is needed in more than one place, extract it to a single shared utility and import it from there.
- If the user tells you not to do something, do not work around it with an indirect command or alternate path; follow the instruction directly or stop and explain the blocker.
- Keep analytics and routing code especially small. For page tracking, prefer a tiny `useLocation`-driven effect unless there is a concrete, unavoidable requirement that truly needs more structure.
- If a user asks you to fix a failing test, keep running the relevant targeted test until it passes or you have a concrete app bug to report back.
- After changing test code or test config, run the smallest relevant targeted test or spec to confirm the change, not the full Cypress suite unless the user explicitly asks for it.
- If cache invalidation is involved, reset the relevant cache so the UI reloads the correct data. Do not paper over stale data with arbitrary cache writes, upserts, or other one-off overrides.
- If a refetch does not return the expected data, do not ad-hoc modify the query cache or mutate the result shape. Fix the underlying query, server response, or refetch path instead.
- Stateless utilities belong to `utils.ts/x`.
- Constants belong to `constants.ts/x`.
- Types belong to `types.ts`.
- Keep stateless helper functions in `utils.ts/x` and shared non-component types in `types.ts`; component files should stay focused on rendering and event wiring.
- When a component stops being small and readable, split it into a component family folder and move stateless helpers out of the component file into `utils.ts/x`.
- A component should have exactly one purpose. If a component starts coordinating multiple concerns or multiple chain integrations, split it into smaller focused components instead of branching inside one file.
- Avoid components with more than 2 hooks. If a component needs a third hook, stop and split the behavior into smaller components or an observer/helper component.
- Never destructure props. Always accept a single `props` parameter and read values directly from `props.foo`.
- Do not introduce useless local constants that only rename an existing value. If a value is just `props.foo`, use `props.foo` directly instead of mirroring it into `const foo = props.foo`.
- If a prop-derived fallback value is only used once, inline it instead of storing it in a local const, for example `props.size || "middle"`.
- Use one component per file by default. If a component family needs to stay together, put those component files in a single CamelCase folder.
- Never use the `function` keyword for React components. Use `export const Component: React.FunctionComponent<ComponentProps> = (props) => {}`. If a component has no props, use `export const Component: React.FunctionComponent = () => {}`.
- When a component uses `React.FunctionComponent` or other React namespace types, import React normally with `import React from "react";` rather than `import type * as React from "react";`.
- Do not add compatibility shim files, fallback re-export files, or similar workaround files when the correct fix is to update imports or references directly. Do not add random shims or loader hacks for broken packages; fix them through supported configuration, documented dependencies, or an approved patch instead.
- Do not import `IncomingMessage` or `ServerResponse` from `node:http` in shared test helpers; use tiny local request/response shapes instead so browser-facing code stays decoupled from Node HTTP typings.
- Do not edit `src/components/hooks.ts` unless the user explicitly asks for changes there.
- Do not edit `deepMergeConcatArrays` in `src/components/query/utils.ts` unless the user explicitly asks for changes there.
- Do not touch the backend repo or backend files from this frontend workspace unless the user explicitly asks for backend changes.
- Do not delete, remove, or alter the `.env` file or any of its records unless the user explicitly instructs you to add something there or otherwise change `.env` directly.
- Do not delete, remove, or alter `dev.env` or any of its records unless the user explicitly instructs you to add something there or otherwise change `dev.env` directly.
- Do not override or "clean up" component changes that the user made unless the user explicitly asks you to change that component. If a component file has user-authored edits, stop and preserve them instead of rewriting the component for convenience.
- If something consumes too much RAM memory, treat it first as a likely implementation bug or a bug in the tests, not as a signal to allocate more memory.
