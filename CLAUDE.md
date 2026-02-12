# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Liberland Marketplace Frontend — a React app connecting users to syndicated free marketplaces. Built with Create React App + react-app-rewired, TypeScript, Ant Design, and a GraphQL backend.

## Commands

- `npm run dev` — Start dev server (react-app-rewired)
- `npm run build` — Production build
- `npm test` — Run tests (react-app-rewired test, Jest + Testing Library)
- `npm run codegen` — Regenerate GraphQL types/hooks from `.graphql` files (requires backend running)
- `npm run deploy` — Deploy to Vercel
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
- `codegen.ts` — GraphQL code generator config
- `config-overrides.js` — Webpack polyfill overrides

## Conventions

- Ant Design for all UI components; SCSS for custom styles (`src/styles/`)
- React Query configured with all automatic refetching disabled (refetchOnMount, refetchOnReconnect, refetchOnWindowFocus all false)
- TypeScript strict mode enabled
- When adding new entities/queries: create `.graphql` file, run `npm run codegen`, then build components using the generated hooks
