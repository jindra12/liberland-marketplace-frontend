# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Network Marketplace Frontend — a React app connecting users to syndicated free marketplaces. Built with Create React App + react-app-rewired, TypeScript, Ant Design, and a GraphQL backend.

## Commands

Use **yarn** (not npm) for all package management and scripts.

- `yarn dev` — Start dev server (react-app-rewired)
- `yarn build` — Production build
- `yarn test` — Run tests (react-app-rewired test, Jest + Testing Library)
- `yarn codegen` — Regenerate GraphQL types/hooks from `.graphql` files (requires backend running)
- `yarn deploy` — Deploy to Vercel
- `postinstall` runs `patch-package` automatically

## Architecture

### Data Flow

GraphQL queries (`.graphql` files in `src/queries/`) → `npm run codegen` generates typed React Query hooks in `src/generated/graphql.ts` → Components consume hooks → `Loader` component handles loading/error states → Ant Design renders UI.

The custom fetcher in `src/gqlFetcher.ts` uses axios to POST to the GraphQL endpoint. The backend URL is currently hardcoded there.

### Component Patterns

Components follow a three-layer pattern per entity (jobs, companies, identities, products):

- **Wrapper** (e.g., `Jobs.tsx`) — simple route component
- **List** (e.g., `JobList.tsx`) — data fetching with infinite scroll pagination via `AppList`
- **Detail** (e.g., `JobDetail.tsx`) — single entity view fetched by ID

Search components (`SearchJobs.tsx`, etc.) live in `src/components/search/` and are orchestrated by `SearchContainer` with a shared `AutoSuggest` component.

Card components live in `src/components/cards/` — reusable across homepage, detail pages, and search results. Homepage card grid (`IdentityMarketSection`) uses a `Row`/`Col` 2x2 layout (`xs={24} xl={12}`), same pattern reused on tribe detail pages.

Delete mutations follow the pattern: `mutation DeleteX($id: String!) { deleteX(id: $id) { id } }` in `src/queries/`. `ProfileContent.tsx` uses these with `Popconfirm`.

### Routing

React Router v7 with lazy-loaded routes defined in `App.tsx`. Entity routes follow `/:entity` (list) and `/:entity/:id` (detail) patterns.

### Theming

Dual light/dark theme using Ant Design's ConfigProvider. Theme tokens in `src/lightToken.ts` and `src/darkToken.ts`, applied via `AntProvider`. Theme follows system preference.

### Webpack Overrides

`config-overrides.js` adds Node.js polyfills (stream, crypto, buffer, process, vm) required by blockchain wallet libraries (Polkadot, Solana, Tron, Thirdweb).

## Key Files

- `src/gqlFetcher.ts` — GraphQL fetcher (axios-based), where backend URL is configured
- `src/generated/graphql.ts` — Auto-generated, do not edit manually
- `src/components/AppList.tsx` — Reusable infinite scroll list
- `src/components/Loader.tsx` — Query loading/error state wrapper
- `src/components/publish/constants.ts` — Shared constants for publish forms (e.g., `currencyOptions`)
- `src/components/publish/MarkdownEditor.tsx` — Thin wrapper around `@uiw/react-md-editor`
- `src/components/cards/` — Reusable card components (`JobCard`, `ProductServiceCard`, `CompanyCard`, `StartupCard`)
- `codegen.ts` — GraphQL code generator config
- `config-overrides.js` — Webpack polyfill overrides

## Conventions

- Ant Design for all UI components; SCSS for custom styles (`src/styles/`)
- **No inline styles** — always use CSS classes in SCSS files instead of `style={{...}}` props
- Component styles follow BEM-like naming in SCSS (e.g., `Publish__back`, `Profile__listingsHeader`, `ImageUpload__label`)
- React Query configured with all automatic refetching disabled (refetchOnMount, refetchOnReconnect, refetchOnWindowFocus all false)
- TypeScript strict mode enabled
- When adding new entities/queries: create `.graphql` file, run `yarn codegen`, then build components using the generated hooks
- **Startup vs Venture naming:** Internal code uses "Startup" (file names, components, variables, types, hooks, CSS classes, cache keys). User-visible strings use "Venture" (labels, messages, headings, route paths `/ventures`). The `entityName` in `useEntityForm` must be `"Startup"` for cache invalidation; `FormSubmitButtons` gets `entityName="Venture"` for the UI label.

## Testing with Playwright

After making changes that affect frontend behavior (UI changes, new features, bug fixes to interactions), **proactively** use the `playwright-cli` skill to visually verify the changes in the browser. This means:

- Check if the dev server is running on localhost:3001, if not, start the dev server
- Navigate to the affected page(s) on localhost:3001
- If you need login use user claudetest2@gmail.com password claudetest2@gmail.com
- Verify the change works as expected (elements render, interactions behave correctly)
- If issues are found, fix them and re-test
- Do this without being asked — it's part of the workflow for UI-affecting changes
- **Clean up after testing** — delete any screenshot files (`.png`) created during Playwright testing so they don't clutter the repo

## Tasks

No open task
