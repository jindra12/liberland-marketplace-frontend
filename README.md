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

### Agent Discovery

Public interfaces are advertised through `/.well-known/api-catalog` (or add
`?format=json` for plain JSON), `/openapi.json`, `/.well-known/ard.json`,
`/.well-known/mcp/server-card.json`, and `/.well-known/agent-skills/index.json`.
`/auth.txt` explains per-backend OAuth. Existing authenticated MCP resource URLs
are unchanged; challenges also expose path-specific resource metadata at
`/.well-known/oauth-protected-resource/api/mcp?serverUrl=...`.
Frontend OAuth/OpenID discovery redirects to the selected backend's canonical
issuer rather than impersonating a frontend authorization server.

Public Next pages accept `Accept: text/markdown` or `?format=markdown`, preserving
HTML, JSON-LD and plain JSON alternatives. Markdown is generated from the same
server-loaded records, with `Vary: Accept` and private/no-store caching.
Robots policy is generated using `REACT_APP_BASE_URL`, keeps private-route
exclusions, and declares search/AI input allowed and model training declined.

The A2A 1.0 agent card is at `/.well-known/agent-card.json`. Send JSON-RPC
`SendMessage` to `/api/a2a`, with `message.role: "ROLE_USER"`, a `messageId`, and a
part such as `{ "data": { "entity": "companies", "tribe": "Liberland", "q": "web development" }, "mediaType": "application/json" }`.
It performs only anonymous public search and returns source-qualified records;
it has no persistent tasks, account writes or payment capability. The official
A2A SDK handles protocol envelopes. Browser WebMCP mirrors the complete remote
MCP tool catalog through the official MCP client; `src/mcp/server.ts` is the
single source for schemas, descriptions, read/write annotations and handlers.
Account tools use the existing app login for the requested backend only. Tokens
are never tool arguments or results. Browser writes require an Ant Design
approval dialog; tool-level confirmations and backend permissions still apply.
Without a login, public reads and supported guest-cart tools remain available.
Signing payments still requires the user's wallet, not an AI tool.
WebMCP requires a browser implementing `document.modelContext`; remote MCP and
ordinary public HTTP discovery do not. Run `yarn test:ct:webmcp` for parity,
credential isolation, cancellation, approval and error-handling checks.

Poppy draft 0.3 discovery is verified against the configured backend issuer,
which must authorize this frontend domain through its existing `FRONTEND_URL`.
The backend uses the published Personal Agent Protocol SDK for direct browser
consent, signed delegated sessions and resource-specific MCP access. Grants and
replay state are encrypted and persisted in MongoDB. Existing Payload account
permissions still apply; writes require their granted scope and confirmation.
Device/mediated sign-in, browser join, Operations and DPoP are not advertised.
Existing backend-qualified OAuth MCP resource identities remain unchanged.
Run `yarn test:ct:poppy` for discovery and issuer-isolation regressions.
The informational payment-protocol checks are not implemented by adding fake
manifests or by paywalling public search.

Run `yarn test:ct:agent-readiness` for protocol/schema/content regressions.
Run `yarn test:ct:agent-auth` for official SDK interoperability: PKCE, refresh
token rotation with restored client credentials, issuer isolation, A2A card
discovery/search, and browser preflight/challenge headers. The OAuth issuer in
these tests is controlled test infrastructure, not a user's live login.
MCP resource metadata advertises `offline_access`, matching the backend issuer,
so clients can request refreshable access. MCP and A2A support anonymous CORS
preflight; MCP accepts explicit bearer headers but never enables credentialed
CORS/cross-origin cookies. Resource metadata is not publicly cached.

TODO: After deployment, publish DNS-AID records for the configured site using
the authoritative DNS provider, then verify propagation. The public catalog is
`/.well-known/ai-catalog.json`. Follow the
[DNS-AID publication guide](https://github.com/dns-aid/dns-aid-core/blob/main/docs/getting-started.md)
without replacing existing DNS records.

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

## Standalone JSON-LD

The homepage, public collection pages and source-qualified detail pages expose
`?format=jsonld`, advertised by both HTML `rel="alternate"` links with
`type="application/ld+json"` and HTTP `Link` headers. These responses reuse the
same generated-query metadata builders as HTML and contain only a JSON-LD
`@context` / `@graph` envelope. Filters, pagination and backend ownership survive
in the alternate URL. Canonical links and entity IDs remain HTML URLs.

```bash
curl 'https://nswap.io/?format=jsonld'
curl 'https://nswap.io/companies?tribe=Liberland&format=jsonld'
curl 'https://nswap.io/products-services?page=2&format=jsonld'
# Append ?format=jsonld to a source-qualified detail URL for its complete graph.
```

Typed relationships connect company `memberOf` tribe, job `hiringOrganization`
company, and product `offers` / `seller` / `itemOffered`. The same related record
has the same backend-specific `@id` wherever it appears. Official company sites
are not confused with tribe membership, sellers are not assumed to be brands,
and prices preserve currency units (USD cents converted to dollars; crypto
decimal strings retained). Schema.org objects use published `schema-dts` types.

Run `yarn test:ct:jsonld` to verify alternate responses and linked metadata.

## Syndicated Sitemaps

`/sitemap.xml` is an index of `/sitemaps/sections.xml` and cached detail shards from
public syndicated backends. It points directly to URL sets, not nested indexes.
The gateway uses each backend's `/api/sitemaps` manifest to discover published
connections, with bounded, cycle-safe traversal. It does not scan entity databases.
Shards are proxied under this domain and their canonical detail URLs retain the
owning backend's encoded URL. Another frontend can reuse the same backend files.

Backends persist snapshots outside their checkout, under
`~/.cache/nswap/sitemaps/<configuration-hash>/` by default (optional
`SITEMAP_CACHE_DIR` for a persistent volume). Snapshots stay fresh for **24 hours**.
Requests serve stale files immediately and trigger a locked refresh after the
response; there is **no cron job**. Failed refreshes retain the last good snapshot
and back off for one hour. Unreferenced shards are retained for **14 days**.
The very first request returns `503` plus `Retry-After: 60` while warming up.

Coverage: tribes, companies, products/services, jobs, ventures, posts, comments,
and published syndications. Only public records are included; private account,
commerce and moderation data are excluded. Each shard has at most 500 URLs.
Record timestamps supply `lastmod`; no fake request-time freshness is advertised.
Only canonical detail/section URLs are listed, not every filter combination.

The frontend needs no persistent filesystem and no Vercel-specific storage.
Standard HTTP cache headers are an optimization, not the source of truth. Deploy
the updated backends first, then the frontend; retry cold manifests to let them
warm up. Unreachable secondary backends are logged and retried on later crawls;
an unavailable primary returns a retryable error rather than an empty sitemap.
Publication/deletion changes appear on the next successful refresh after the TTL.

Verify the gateway with `yarn test:ct:sitemaps`. Backend cache implementation and
operational details are documented in its `src/sitemaps/README.md`.

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
These filters do not modify the interactive SPA. A short visually clipped SSR
body guide provides real links to `/llms.txt`, `/LLM.md`, `/tribes` and example
GET searches, without adding visible UI. It is aria-hidden and its links are
excluded from keyboard tab order. Readers that ignore aria-hidden content can
use the head metadata and public GET search. Page descriptions include a no-JavaScript
recovery hint; head `rel="help"` links and `robots.txt` comments advertise the
guides. Robots comments are discovery hints, not standardized crawler directives.
Regular and tribe-filtered collection JSON-LD includes real result links, counts,
and `hasPart` pagination; HTTP/head pagination links use the same URL builder.

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

# Public HTTP Discovery

Agents without MCP, authentication, or JavaScript can start at `/llms.txt`:

- JSON: `/api/search/tribe?entity=companies&tribe=Liberland&q=web%20development&format=json`.
- Ordinary HTML: `/companies?tribe=Liberland&q=web%20development`; `&format=html` retains the readable view in browsers.
- Company profiles: follow each result's canonical `url`. Profiles include descriptions and related services in their SSR body.
- Original JSON-LD: omit `format=json` on the search API, or append `format=jsonld` to a canonical collection/profile URL.
- Extended instructions: `/LLM.txt` (text/plain), or `/LLM.md` (original Markdown).

`entity` supports companies, products, and jobs. `serverUrl` selects the public source
backend, `tribeId` disambiguates names, and `page`/`limit` paginate. Follow JSON
`links.next`/`previous` or HTML pagination links to preserve the complete query.
`q` is word matching over actual names/descriptions and affiliated company services,
not RAG; web also matches website/websites/frontend. Tribe membership is established
by backend relationship filters, never a word in a description. This is affiliation,
not proof of geographic location/incorporation. Legacy tribe relationships may filter
correctly while their populated detail field is null; JSON includes query provenance.
Scans over 2,000 records per entity fail explicitly instead of returning partial matches.

Search errors distinguish invalid input (400), unknown tribe (404), ambiguous tribe
(409), throttling (429), backend failure (502), and capacity/scan limits (503).
Empty matches are successful JSON with `docs: []` and `totalDocs: 0`.
The normal browser SPA replaces the visible SSR fallback after hydration; it does
not display a duplicate listing below the app. JSON-LD and MCP remain available.

Run `yarn test:ct:public-discovery` for handler, HTML-only parsing, relationship,
service matching, error, provenance, and pagination regressions. Its AlfaPi fixture
is a real published record captured October 26, 2026; production data is not modified.

