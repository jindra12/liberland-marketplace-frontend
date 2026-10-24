# NSwap Frontend

NSwap is the frontend for a syndicated marketplace network.

It lets people browse, search, and open detail pages for jobs, companies, products and services, ventures, tribes, posts, and syndication endpoints. It also supports publishing, commenting, liking, sharing, carting, ordering, and chain-based payment flows when the connected backend exposes those features.

## What it is for

- Discovery across multiple compatible marketplace backends
- Detail pages for marketplace entities and syndication endpoints
- Publishing and editing marketplace content
- Commerce flows for cart, order, and payment
- Identity and tribe-based browsing

## Tech Stack

- Next.js
- React 18
- TypeScript
- React Router
- Ant Design
- GraphQL
- Cypress component tests

## Structure

- `src/Main.tsx` mounts the app and route tree
- `src/routes.ts` defines shared route helpers
- `src/components/` contains the UI and business flows
- `cypress/component/` contains the component test suite

## Notes

- The app is designed around syndication, so route URLs include backend server context.
- The public homepage is a discovery surface, not just a landing page.
- The UI expects multiple account, wallet, and shipping-address states across different flows.

## MCP Setup

### Gateway Security Limits

- MCP and public RAG requests are limited to 120 requests per client per minute and 1,200 requests per process per minute.
- RAG is limited to 40 backend searches per client per hour and 400 per process per hour. A query sent to eight backends consumes eight searches, including failed attempts.
- HTTP rate-limit responses use status `429` and a `Retry-After` header. MCP RAG tool errors include the retry delay.
- Limits use `rate-limiter-flexible` in memory. They reset when a process restarts and are not shared across workers or serverless instances. Enforce deployment-wide limits through the hosting firewall or a shared rate-limit store before relying on these as a hard spending cap.
- Client identifiers are hashed. Vercel-managed forwarding headers are trusted only on Vercel; other deployments use the socket address. A self-hosted reverse proxy therefore shares one limit unless its trusted client-address handling is configured separately.
- Server-side marketplace requests use HTTPS and `guarded-fetch` for SSRF protection, with redirects disabled and bounded response sizes and deadlines.

### Connecting

Codex can connect to the Nswap syndicated MCP gateway over OAuth. The authenticated URL
selects the backend whose account and permissions will be used for that MCP connection.
Deploy both the frontend gateway and the backend OAuth metadata route before connecting.

```bash
codex mcp remove nswap-backend 2>/dev/null || true

codex mcp add nswap-backend \
  --url 'https://nswap.io/api/mcp?auth=required&serverUrl=https%3A%2F%2Fbackend.nswap.io'

codex mcp login nswap-backend
codex mcp get nswap-backend
codex mcp list
```

For a different syndicated backend, register a separate MCP entry and log in to that
backend separately. Encode the backend URL as the `serverUrl` query value:

```bash
codex mcp add nswap-example \
  --url 'https://nswap.io/api/mcp?auth=required&serverUrl=https%3A%2F%2Fmarket.example.com'

codex mcp login nswap-example
```

If `codex` is not installed on `PATH`, prefix the same commands with `npx @openai/codex`:

```bash
npx @openai/codex mcp add nswap-backend \
  --url 'https://nswap.io/api/mcp?auth=required&serverUrl=https%3A%2F%2Fbackend.nswap.io'

npx @openai/codex mcp login nswap-backend
npx @openai/codex mcp get nswap-backend
```

Codex stores the OAuth credentials locally after `mcp login`; no bearer-token environment
variable is required. Each syndicated backend has its own login, so use one MCP entry per
backend when authenticated operations need to span multiple servers.
