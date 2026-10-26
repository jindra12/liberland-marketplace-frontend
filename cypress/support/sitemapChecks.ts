import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import dns from "node:dns";
import { syncBuiltinESMExports } from "node:module";
import { Readable } from "node:stream";
import { mock } from "node:test";
import { parseSitemap, parseSitemapIndex } from "sitemap";
import type { BackendSitemapManifest } from "../../src/server/sitemaps/types";

const root = "https://one.example";
const other = "https://two.example";
const file = `companies-${"a".repeat(64)}.xml`;

const manifest = (serverUrl: string, syndicatedServers: string[] = []): BackendSitemapManifest => ({
    version: 1, generatedAt: "2026-10-20T00:00:00.000Z", serverUrl, frontendUrl: "https://another-market.example",
    syndicatedServers, shards: [{ file, lastmod: "2026-10-19T00:00:00.000Z", count: 1 }],
});

const withPublicBackend = async (check: () => Promise<void>) => {
    const previous = process.env.REACT_APP_BACKEND_URL;
    process.env.REACT_APP_BACKEND_URL = root;
    const lookup = mock.method(dns.promises, "lookup", async () => [{ address: "8.8.8.8", family: 4 }]);
    syncBuiltinESMExports();
    try {
        await check();
    } finally {
        if (previous === undefined) {
            delete process.env.REACT_APP_BACKEND_URL;
        } else {
            process.env.REACT_APP_BACKEND_URL = previous;
        }
        lookup.mock.restore();
        syncBuiltinESMExports();
    }
    return true;
};

export const sitemapChecks = {
    sitemapAggregation: async () => withPublicBackend(async () => {
        const { buildSyndicatedSitemapIndex } = await import("../../src/server/sitemaps/utils");
        const { SITE_URL } = await import("../../src/siteUrl");
        const requested: string[] = [];
        const fetchMock = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
            const request = new Request(input, init);
            assert.equal(request.method, "GET");
            assert.equal(request.headers.get("authorization"), null);
            assert.equal(new URL(request.url).pathname, "/api/sitemaps");
            requested.push(request.url);
            return Response.json(request.url.startsWith(root) ? manifest(root, [other, root]) : manifest(other, [root]));
        });
        try {
            const xml = await buildSyndicatedSitemapIndex();
            const entries = await parseSitemapIndex(Readable.from([xml]));
            assert.equal(entries.length, 3);
            assert(entries.some((entry) => entry.url === `${SITE_URL}/sitemaps/sections.xml`));
            [root, other].forEach((serverUrl) => assert(entries.some((entry) => entry.url === `${SITE_URL}/sitemaps/${Buffer.from(serverUrl).toString("hex")}/${file}`)));
            assert.equal(new Set(requested).size, 2);
            assert.equal(requested.length, 2, "Discovery cycles must not repeat backend requests");
            assert(!xml.includes("2026-10-20T"), "Index lastmod must describe shard changes, not request time");
        } finally {
            fetchMock.mock.restore();
        }
    }),
    sitemapProxy: async () => withPublicBackend(async () => {
        const { buildSitemapXml, fetchBackendSitemapShard } = await import("../../src/server/sitemaps/utils");
        const { SITE_URL } = await import("../../src/siteUrl");
        const segment = Buffer.from(root).toString("hex");
        const xml = await buildSitemapXml([{ url: `https://another-market.example/companies/record-id/${segment}`, lastmod: "2026-01-02T00:00:00.000Z" }]);
        const filename = `companies-${createHash("sha256").update(xml).digest("hex")}.xml`;
        const fetchMock = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
            const request = new Request(input, init);
            assert.equal(request.url, `${root}/api/sitemaps/${filename}`);
            assert.equal(request.headers.get("authorization"), null);
            return new Response(xml, { headers: { "Content-Type": "application/xml" } });
        });
        try {
            const result = await fetchBackendSitemapShard(segment, filename);
            const entries = await parseSitemap(Readable.from([result]));
            assert.equal(entries[0].url, `${SITE_URL}/companies/record-id/${segment}`);
            assert.equal(entries[0].lastmod, "2026-01-02T00:00:00.000Z");
            assert(!result.includes("another-market.example"));
            await assert.rejects(fetchBackendSitemapShard(segment, "../manifest.json"));
            await assert.rejects(fetchBackendSitemapShard(Buffer.from("https://127.0.0.1").toString("hex"), filename));
            assert.equal(fetchMock.mock.callCount(), 1);
        } finally {
            fetchMock.mock.restore();
        }
    }),
    sitemapFailures: async () => withPublicBackend(async () => {
        const { buildSyndicatedSitemapIndex, fetchBackendSitemapManifest, fetchBackendSitemapShard } = await import("../../src/server/sitemaps/utils");
        const unavailable = mock.method(globalThis, "fetch", async () => new Response("Warming up", { status: 503 }));
        try {
            await assert.rejects(buildSyndicatedSitemapIndex(), /unavailable or warming/);
        } finally {
            unavailable.mock.restore();
        }
        const mismatch = mock.method(globalThis, "fetch", async () => Response.json(manifest(other)));
        try {
            await assert.rejects(fetchBackendSitemapManifest(root), /source does not match/);
        } finally {
            mismatch.mock.restore();
        }
        const broken = mock.method(globalThis, "fetch", async () => new Response("Not the hashed XML"));
        try {
            await assert.rejects(fetchBackendSitemapShard(Buffer.from(root).toString("hex"), file), /immutable filename/);
        } finally {
            broken.mock.restore();
        }
    }),
    sitemapBoundaries: async () => {
        const { buildSitemapIndexXml, buildSitemapXml, sitemapManifestSchema } = await import("../../src/server/sitemaps/utils");
        const { MAX_SITEMAP_INDEX_ENTRIES } = await import("../../src/server/sitemaps/constants");
        await assert.rejects(buildSitemapIndexXml(Array.from({ length: MAX_SITEMAP_INDEX_ENTRIES + 1 }, () => ({ url: "https://market.example/file.xml" }))), /protocol limit/);
        const invalid = { ...manifest(root), shards: [{ file: "../../private.xml", lastmod: "2026-01-01T00:00:00.000Z", count: 1 }] };
        assert.equal(sitemapManifestSchema.safeParse(invalid).success, false);
        const url = "https://market.example/companies?name=one&tribe=two";
        const xml = await buildSitemapXml([{ url }]);
        assert(xml.includes("&amp;"));
        assert.equal((await parseSitemap(Readable.from([xml])))[0].url, url);
        return true;
    },
};
