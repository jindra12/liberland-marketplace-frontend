import assert from "node:assert/strict";
import dns from "node:dns";
import { syncBuiltinESMExports } from "node:module";
import { mock } from "node:test";
import { readFileSync } from "node:fs";
import { createMocks } from "node-mocks-http";
import { stripIgnoredCharacters } from "graphql";
import type { NextApiRequest, NextApiResponse } from "next";
import {
    ListCompaniesByIdentityDocument,
    ListIdentitiesDocument,
    ListProductsByIdentityDocument,
} from "../../src/generated/graphql";
import fixture from "../fixtures/publicDiscovery.json";

const source = fixture.company.serverURL;
type RequestBody = { query: string; variables: { identityId?: string; page: number; limit: number } };

const withBackend = async (check: () => Promise<void>) => {
    const dnsMock = mock.method(dns.promises, "lookup", async () => [{ address: "8.8.8.8", family: 4 }]);
    syncBuiltinESMExports();
    const fetchMock = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
        const request = new Request(input, init);
        assert.equal(request.url, `${source}/api/graphql`);
        assert.equal(request.headers.get("authorization"), null);
        const body = (await request.json()) as RequestBody;
        if (body.query === ListIdentitiesDocument) {
            return Response.json({ data: { Identities: { docs: [fixture.tribe], hasNextPage: false } } });
        }
        assert.equal(body.variables.identityId, fixture.tribe.id);
        switch (body.query) {
            case ListCompaniesByIdentityDocument:
                assert(stripIgnoredCharacters(body.query).includes("identity:{equals:$identityId}"));
                return Response.json({
                    data: {
                        Companies: {
                            docs: [
                                fixture.company,
                                { id: "unrelated-service", name: "Coffee company", description: "Coffee and tea." },
                            ],
                            totalDocs: 2,
                            hasNextPage: false,
                        },
                    },
                });
            case ListProductsByIdentityDocument:
                assert(stripIgnoredCharacters(body.query).includes("companyIdentityId:{equals:$identityId}"));
                return Response.json({
                    data: {
                        Products: {
                            docs: [{ ...fixture.service, company: { id: fixture.company.id } }],
                            totalDocs: 1,
                            hasNextPage: false,
                        },
                    },
                });
            default:
                throw new Error("Unexpected query: discovery must reuse generated relationship filters.");
        }
    });
    try {
        await check();
    } finally {
        fetchMock.mock.restore();
        dnsMock.mock.restore();
        syncBuiltinESMExports();
    }
    return true;
};

export const publicDiscoveryChecks = {
    publicDiscoveryMarkup: async () => {
        const { renderToStaticMarkup } = await import("react-dom/server");
        const React = await import("react");
        const { PublicContent } = await import("../../src/aiDiscovery/PublicContent");
        return renderToStaticMarkup(
            React.createElement(PublicContent, {
                content: {
                    title: "Liberland companies",
                    description: "Published companies with primary Liberland affiliation.",
                    items: [
                        {
                            name: fixture.company.name,
                            description: fixture.company.description,
                            url: `https://nswap.io/companies/${fixture.company.id}/${Buffer.from(source).toString("hex")}`,
                        },
                    ],
                    links: [],
                },
            }),
        );
    },
    publicDiscoveryWorkflow: async () =>
        withBackend(async () => {
            const { default: handler } = await import("../../src/pages/api/search/tribe");
            const { fetchTribeSearchMetadata, fetchListedTribe } = await import("../../src/server/tribeSearch/utils");
            const { renderToStaticMarkup } = await import("react-dom/server");
            const React = await import("react");
            const { PublicContent } = await import("../../src/aiDiscovery/PublicContent");
            const guide = readFileSync("public/llms.txt", "utf8");
            const endpoint = guide.match(
                /https:\/\/[^\s]+\/api\/search\/tribe\?entity=companies&tribe=Liberland&format=json/,
            );
            assert(endpoint, "Start from llms.txt, not a hard-coded undiscoverable route");
            const query = {
                ...Object.fromEntries(new URL(endpoint[0]).searchParams),
                serverUrl: source,
                q: "web development",
            };
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: "GET", query });
            await handler(req, res);
            assert.equal(res.statusCode, 200);
            assert.match(String(res.getHeader("Content-Type")), /application\/json/);
            const result = JSON.parse(res._getData()) as {
                docs: Array<{
                    name: string;
                    description: string;
                    url: string;
                    serverUrl: string;
                    tribe: { id: string };
                }>;
                totalDocs: number;
                affiliationEvidence: { field: string; equals: string };
            };
            assert.equal(result.totalDocs, 1, "An unrelated tribe company must not qualify as a web developer");
            assert.equal(result.docs[0].name, fixture.company.name);
            assert.match(result.docs[0].description, /website development/);
            assert.equal(result.docs[0].tribe.id, fixture.tribe.id);
            assert.equal(result.affiliationEvidence.field, "identity");
            assert.equal(result.affiliationEvidence.equals, fixture.tribe.id);
            assert.equal(result.docs[0].serverUrl, source);
            assert(
                result.docs[0].url.endsWith(`/companies/${fixture.company.id}/${Buffer.from(source).toString("hex")}`),
            );
            const metadata = await fetchTribeSearchMetadata({
                entity: "companies",
                tribe: fixture.tribe.name,
                serverUrl: source,
                q: "web development",
                page: 1,
                limit: 20,
            });
            const html = renderToStaticMarkup(React.createElement(PublicContent, { content: metadata.content }));
            assert(html.includes(fixture.company.name));
            assert(html.includes(result.docs[0].url));
            assert.match(html, /Tribe affiliation:/);
            assert(!html.includes("aria-hidden"));
            assert(!html.includes("screen-reader-only"));
            assert(!html.includes("<script"));
            assert.match(JSON.stringify(metadata.jsonLd), /memberOf/);
            const listedTribe = await fetchListedTribe({ id: fixture.tribe.id }, source);
            assert.equal(listedTribe.Identity?.id, fixture.tribe.id, "Canonical tribe metadata must not depend on the broken legacy by-ID resolver");
        }),
    publicDiscoveryErrors: async () =>
        withBackend(async () => {
            const { default: handler } = await import("../../src/pages/api/search/tribe");
            const run = async (query: Record<string, string>) => {
                const response = createMocks<NextApiRequest, NextApiResponse>({
                    method: "GET",
                    query: {
                        entity: "companies",
                        tribe: fixture.tribe.name,
                        serverUrl: source,
                        format: "json",
                        ...query,
                    },
                });
                await handler(response.req, response.res);
                return response.res;
            };
            const empty = await run({ q: "underwater basket weaving" });
            assert.equal(empty.statusCode, 200);
            assert.deepEqual(JSON.parse(empty._getData()).docs, []);
            assert.equal(JSON.parse(empty._getData()).totalDocs, 0);
            assert.equal((await run({ tribe: "Not a tribe" })).statusCode, 404);
            assert.equal((await run({ serverUrl: "https://127.0.0.1" })).statusCode, 400);
            assert.equal((await run({ page: "0" })).statusCode, 400);
            assert.equal((await run({ format: "invented" })).statusCode, 400);
            const failureMock = mock.method(
                globalThis,
                "fetch",
                async () => new Response("Backend offline", { status: 503 }),
            );
            try {
                const failed = await run({});
                assert.equal(failed.statusCode, 502);
                assert.equal(JSON.parse(failed._getData()).code, "BACKEND_SEARCH_FAILED");
                assert.equal(failed.getHeader("Cache-Control"), "no-store");
            } finally {
                failureMock.mock.restore();
            }
        }),
    publicDiscoveryPagination: async () =>
        withBackend(async () => {
            const { default: handler } = await import("../../src/pages/api/search/tribe");
            const first = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: {
                    entity: "companies",
                    tribe: fixture.tribe.name,
                    serverUrl: source,
                    q: "company",
                    format: "json",
                    limit: "1",
                },
            });
            // Test page links against known totals without relying on a particular sort order.
            const { buildTribeJsonResponse } = await import("../../src/server/tribeSearch/results/utils");
            const body = buildTribeJsonResponse({
                input: { entity: "companies", page: 2, limit: 1, q: "web development" },
                tribe: fixture.tribe,
                serverUrl: source,
                listing: { docs: [fixture.company], totalDocs: 3, hasNextPage: true },
            });
            [body.links.next!, body.links.previous!].forEach((href) => {
                const url = new URL(href);
                assert.equal(url.searchParams.get("format"), "json");
                assert.equal(url.searchParams.get("tribeId"), fixture.tribe.id);
                assert.equal(url.searchParams.get("serverUrl"), source);
                assert.equal(url.searchParams.get("q"), "web development");
            });
            await handler(first.req, first.res);
            const firstPage = JSON.parse(first.res._getData()) as ReturnType<typeof buildTribeJsonResponse>;
            assert.equal(firstPage.totalDocs, 2);
            assert.equal(firstPage.docs.length, 1);
            assert(firstPage.links.next);
            assert.match(String(first.res.getHeader("Link")), /rel="next"/);
            const next = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: Object.fromEntries(new URL(firstPage.links.next).searchParams),
            });
            await handler(next.req, next.res);
            const secondPage = JSON.parse(next.res._getData()) as ReturnType<typeof buildTribeJsonResponse>;
            assert.equal(next.res.statusCode, 200);
            assert.equal(secondPage.page, 2);
            assert.equal(secondPage.totalDocs, 2);
            assert.notEqual(secondPage.docs[0].id, firstPage.docs[0].id);
            assert.equal(secondPage.links.next, null);
            assert(secondPage.links.previous);
            const legacy = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { entity: "companies", tribe: fixture.tribe.name, serverUrl: source },
            });
            await handler(legacy.req, legacy.res);
            assert.match(String(legacy.res.getHeader("Content-Type")), /application\/ld\+json/);
            assert.equal(JSON.parse(legacy.res._getData())["@type"], "CollectionPage");
        }),
    publicDiscoveryServiceEvidence: async () => {
        const { matchesServiceQuery } = await import("../../src/server/tribeSearch/results/utils");
        assert(
            matchesServiceQuery(
                { ...fixture.company, description: "", services: [{ ...fixture.service, url: "/service" }] },
                "web development",
            ),
            "A company's actual related service can establish the service match even without its own description",
        );
        assert(
            !matchesServiceQuery(
                { id: "unrelated", name: "Coffee", description: "Coffee sold in Liberland." },
                "web development",
            ),
        );
        return true;
    },
};
