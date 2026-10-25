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
# AI Tribe Search

Agents can find **companies, products/services, and jobs by tribe affiliation**
without running the SPA or connecting MCP. For example:

```bash
curl 'https://nswap.io/api/search/tribe?entity=companies&tribe=Liberland'
curl 'https://nswap.io/api/search/tribe?entity=products&tribe=Liberland'
curl 'https://nswap.io/api/search/tribe?entity=jobs&tribe=Liberland&page=2'
```

These public GET requests return JSON-LD. Use `tribe` (exact name,
case-insensitive) or `tribeId`, optional `serverUrl`, `page` and `limit` (1–100,
default 20). Backend-specific IDs prevent cross-server collisions; ambiguous
names return candidate IDs instead of silently picking one. No RAG credits needed.

The homepage/collection JSON-LD advertises SearchAction EntryPoints. Tribe detail
`Organization.subjectOf` links expose full filtered collections; follow their
ItemList detail URLs and `hasPart` pagination links. `/companies?tribe=Liberland`,
`/products-services?tribe=Liberland`, and `/jobs?tribe=Liberland` expose the same
results in SSR head metadata, with filter-preserving canonical/prev/next links.
These filters do not modify the interactive SPA. No extra body UI is rendered.

MCP clients can call public `find_by_tribe` after `describe_backend`, e.g.
`{"entity":"companies","tribe":"Liberland","limit":5}`. Products/services use
`entity: "products"`; jobs use `"jobs"`. With no serverUrl, the gateway queries
active/default backends through their MCPs. Discover additional servers with
`discover_syndicated_servers` and pass their serverUrl explicitly. Authenticated
clients can also add servers to their active cache. Results/errors retain sources.

Affiliation is Company.identity, or the employer/seller's companyIdentityId for
jobs/products. It is not a keyword match, allowedIdentities eligibility, or proof
of incorporation/location. See [`public/llms.txt`](public/llms.txt) and
[`public/LLM.md`](public/LLM.md) for agent instructions and relationship filters.

