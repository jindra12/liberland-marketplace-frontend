import assert from "node:assert/strict";
import dns from "node:dns";
import { mock } from "node:test";
import { syncBuiltinESMExports } from "node:module";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { TRIBE_ENTITIES } from "../../src/tribeSearch/constants";
import { ListCompaniesByIdentityDocument, ListJobsByIdentityDocument, ListProductsByIdentityDocument, ListIdentitiesDocument } from "../../src/generated/graphql";
import type { TribeListing, TribeSearchInput } from "../../src/tribeSearch/types";

const source = "https://tribe.example";
const tribe = { id: "liberland-id", name: "Liberland" };
const listing: TribeListing = {
    docs: [{ id: "listing-id", name: "Coffee company", title: "Developer", description: "Tribe-affiliated listing" }],
    totalDocs: 55,
    hasNextPage: true,
};

const withPublicDns = async (check: () => Promise<void>) => {
    const lookup = mock.method(dns.promises, "lookup", async () => [{ address: "8.8.8.8", family: 4 }]);
    syncBuiltinESMExports();
    try {
        await check();
    } finally {
        lookup.mock.restore();
        syncBuiltinESMExports();
    }
    return true;
};

export const tribeSearchChecks = {
    tribeSearchGraphql: async () => withPublicDns(async () => {
        const { fetchTribeSearchMetadata } = await import("../../src/server/tribeSearch/utils");
        const requests: Array<{ query: string; variables: { identityId?: string; searchTerm?: string; page: number; limit: number } }> = [];
        const fetchMock = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
            const request = new Request(input, init);
            assert.equal(request.url, `${source}/api/graphql`);
            assert.equal(request.headers.get("authorization"), null);
            const body = await request.json() as typeof requests[number];
            requests.push(body);
            if (body.query === ListIdentitiesDocument) {
                return Response.json({ data: { Identities: { docs: [tribe], hasNextPage: false } } });
            }
            assert.equal(body.variables.identityId, tribe.id);
            assert.equal(body.variables.page, 2);
            assert.equal(body.variables.limit, 5);
            switch (body.query) {
                case ListCompaniesByIdentityDocument:
                    return Response.json({ data: { Companies: listing } });
                case ListProductsByIdentityDocument:
                    return Response.json({ data: { Products: listing } });
                case ListJobsByIdentityDocument:
                    return Response.json({ data: { Jobs: listing } });
                default:
                    throw new Error("Unexpected query: must reuse a generated tribe-filtered document.");
            }
        });
        try {
            await Promise.all(TRIBE_ENTITIES.map(async (entity) => {
                const metadata = await fetchTribeSearchMetadata({ entity, tribe: "liberland", serverUrl: source, page: 2, limit: 5 });
                assert.match(metadata.description, /Liberland/);
                assert.match(metadata.canonicalPath, /tribeId=liberland-id/);
                assert.match(metadata.canonicalPath, /limit=5/);
                assert.equal(metadata.extraLinks.length, 2);
                metadata.extraLinks.forEach((link) => {
                    const url = new URL(link.href, source);
                    assert.equal(url.searchParams.get("tribeId"), tribe.id);
                    assert.equal(url.searchParams.get("serverUrl"), source);
                    assert.equal(url.searchParams.get("limit"), "5");
                });
                const graph = JSON.stringify(metadata.jsonLd);
                assert.match(graph, /listing-id/);
                assert.match(graph, /"numberOfItems":55/);
                assert.match(graph, /"position":6/);
                assert.match(graph, /"name":"next"/);
                assert.match(graph, /74726962652e6578616d706c65/);
            }));
            assert.equal(requests.length, 6);
        } finally {
            fetchMock.mock.restore();
        }
    }),
    tribeSearchSafety: async () => withPublicDns(async () => {
        const { fetchTribeSearchMetadata } = await import("../../src/server/tribeSearch/utils");
        const { selectTribe, tribeSearchSchema } = await import("../../src/tribeSearch/utils");
        assert.deepEqual(selectTribe([tribe], "LIBERLAND"), tribe);
        assert.throws(() => selectTribe([{ id: "other", name: "Liberland fans" }], "Liberland"), /No tribe/);
        assert.throws(() => selectTribe([tribe, { id: "second", name: "LIBERLAND" }], "Liberland"), /Ambiguous.*second/);
        [
            { entity: "users", tribe: "Liberland" },
            { entity: "companies" },
            { entity: "jobs", tribe: "Liberland", page: -1 },
            { entity: "products", tribe: "Liberland", limit: 101 },
            { entity: "jobs", tribe: ["Liberland"] },
        ].forEach((input) => assert.equal(tribeSearchSchema.safeParse(input).success, false));
        const fetchMock = mock.method(globalThis, "fetch", async () => Response.json({ data: {
            Identities: { docs: [], hasNextPage: false },
        } }));
        try {
            await assert.rejects(fetchTribeSearchMetadata({ entity: "companies", tribe: "Unknown", serverUrl: source, page: 1, limit: 20 }), /No tribe/);
            assert.equal(fetchMock.mock.callCount(), 1, "No unfiltered listing query after a missing tribe");
            await assert.rejects(fetchTribeSearchMetadata({ entity: "jobs", tribe: "Liberland", serverUrl: "https://127.0.0.1", page: 1, limit: 20 }));
            assert.equal(fetchMock.mock.callCount(), 1, "Private sources blocked before network access");
        } finally {
            fetchMock.mock.restore();
        }
    }),
    tribeSearchDiscovery: async () => {
        const { buildIdentityPageMetadata } = await import("../../src/detailMetadata/identity");
        const { SEO_BY_ROUTE } = await import("../../src/shellPage/seo");
        const metadata = buildIdentityPageMetadata({ ...tribe, serverURL: source }, "/tribes/liberland-id/source");
        const graph = JSON.stringify(metadata.jsonLd);
        ["/companies?tribeId=", "/products-services?tribeId=", "/jobs?tribeId="].forEach((path) => assert(graph.includes(path)));
        assert.match(graph, /subjectOf/);
        ["/", "/companies", "/products-services", "/jobs", "/tribes"].forEach((route) => {
            const graph = JSON.stringify(SEO_BY_ROUTE[route].buildJsonLd?.(route, 1));
            TRIBE_ENTITIES.forEach((entity) => assert(graph.includes(`/api/search/tribe?entity=${entity}&tribe={tribe}`)));
        });
        return true;
    },
    aiDiscoverySsr: async () => {
        const React = await import("react");
        const { renderToStaticMarkup } = await import("react-dom/server");
        const { DiscoveryGuide } = await import("../../src/aiDiscovery/DiscoveryGuide");
        const html = renderToStaticMarkup(React.createElement(DiscoveryGuide));
        assert.match(html, /class="[^"]*screen-reader-only/);
        assert.match(html, /href="\/llms.txt"/);
        assert.match(html, /href="\/LLM.md"/);
        assert.match(html, /JSON-LD/);
        assert.match(html, /href="\/tribes"/);
        TRIBE_ENTITIES.forEach((entity) => assert(html.includes(`/api/search/tribe?entity=${entity}&amp;tribe=Liberland`)));
        assert.match(html, /aria-hidden="true"/);
        assert.equal((html.match(/tabindex="-1"/g) || []).length, 6);
        assert(!html.includes("display:none"));
        return true;
    },
    aiDiscoveryPagination: async () => {
        const { SEO_BY_ROUTE } = await import("../../src/shellPage/seo");
        const { buildPaginationLinks } = await import("../../src/shellPage/utils");
        const data = {
            items: [{ name: "Liberland", url: `${source}/tribes/tribe-id/server`, description: "A tribe" }],
            page: 2, totalItems: 55, totalPages: 3, hasNextPage: true,
        };
        const graph = JSON.stringify(SEO_BY_ROUTE["/tribes"].buildJsonLd?.("/tribes?page=2", 2, data));
        assert.match(graph, /"numberOfItems":55/);
        assert.match(graph, /"name":"Next page"/);
        assert.match(graph, /\/tribes\?page=3/);
        assert.match(graph, /"name":"Previous page"/);
        assert(graph.includes(data.items[0].url));
        const last = JSON.stringify(SEO_BY_ROUTE["/tribes"].buildJsonLd?.("/tribes?page=3", 3, { ...data, page: 3, hasNextPage: false }));
        assert(!last.includes('"name":"Next page"'));
        buildPaginationLinks("/companies?tribeId=tribe-id&serverUrl=https%3A%2F%2Ftribe.example&limit=5&page=2", 2, true).forEach((link) => {
            const url = new URL(link.href, source);
            assert.equal(url.searchParams.get("tribeId"), "tribe-id");
            assert.equal(url.searchParams.get("serverUrl"), source);
            assert.equal(url.searchParams.get("limit"), "5");
        });
        return true;
    },
    tribeSearchMcp: async () => withPublicDns(async () => {
        const { createNswapMcpServer } = await import("../../src/mcp/server");
        const calls: Array<{ name: string; arguments: { entity: string; where?: { AND: Array<Record<string, { equals: string | boolean }>> } } }> = [];
        const fetchMock = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
            const request = new Request(input, init);
            assert.equal(request.url, `${source}/api/mcp`);
            assert.equal(request.headers.get("authorization"), null);
            if (request.method !== "POST") {
                return new Response(null, { status: 405 });
            }
            const body = await request.json() as { id?: number; method: string; params: { protocolVersion: string } & typeof calls[number] };
            if (body.method === "initialize") {
                return Response.json({ jsonrpc: "2.0", id: body.id, result: { protocolVersion: body.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "test-backend", version: "1.0.0" } } });
            }
            if (body.method === "tools/call") {
                calls.push(body.params);
                const value = body.params.arguments.entity === "identities" ? { docs: [tribe], hasNextPage: false } : listing;
                return Response.json({ jsonrpc: "2.0", id: body.id, result: { content: [{ type: "text", text: JSON.stringify(value) }] } });
            }
            return new Response(null, { status: 202 });
        });
        const server = createNswapMcpServer(undefined, source, "tribe-search-test");
        const client = new Client({ name: "tribe-search-tests", version: "1.0.0" });
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        try {
            await server.connect(serverTransport);
            await client.connect(clientTransport);
            const tools = await client.listTools();
            assert(tools.tools.some((tool) => tool.name === "find_by_tribe" && tool.annotations?.readOnlyHint));
            await Promise.all(TRIBE_ENTITIES.map(async (entity) => {
                const args: TribeSearchInput = { entity, tribe: "Liberland", page: 1, limit: 20 };
                const result = await client.callTool({ name: "find_by_tribe", arguments: args });
                assert(!result.isError);
                assert.match(JSON.stringify(result), /Coffee company/);
                assert.match(JSON.stringify(result), /tribe\.example/);
            }));
            const listings = calls.filter((call) => call.arguments.entity !== "identities");
            assert.equal(listings.length, 3);
            listings.forEach((call) => {
                assert.equal(call.name, "list_entities");
                const field = call.arguments.entity === "companies" ? "identity" : "companyIdentityId";
                assert(call.arguments.where?.AND.some((filter) => filter[field]?.equals === tribe.id));
                assert(!call.arguments.where?.AND.some((filter) => filter._status), "Published-only access is enforced by anonymous backend reads");
            });
        } finally {
            await client.close();
            await server.close();
            fetchMock.mock.restore();
        }
    }),
};
