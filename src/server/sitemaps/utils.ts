import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import type { GetServerSideProps } from "next";
import { parseSitemap, SitemapIndexStream, SitemapStream, streamToPromise } from "sitemap";
import type { IndexItem, SitemapItemLoose } from "sitemap";
import { z } from "zod";

import { SITE_URL } from "../../siteUrl";
import { decodeServerUrlSegment, encodeServerUrlSegment } from "../../routes";
import { buildDetailUrl } from "../../detailMetadata/related";
import { discoverBackends } from "../../mcp/discovery";
import { getDefaultBackendUrl } from "../../mcp/routing";
import { normalizePublicBackendUrl, publicBackendFetch } from "../security/utils";
import { acquireRequestSlot } from "../security/limits";
import { checkRequestLimit, getClientRateLimitKey } from "../security/rateLimits";
import { REQUEST_TIMEOUT_MS } from "../security/constants";
import { MAX_SITEMAP_INDEX_ENTRIES, MAX_SITEMAP_SHARDS, MAX_SITEMAP_SHARD_URLS, SITEMAP_COLLECTION_PATHS, SITEMAP_FILE_PATTERN, SITEMAP_SECTIONS } from "./constants";
import type { BackendSitemapManifest } from "./types";

export const sitemapManifestSchema = z.object({
    version: z.literal(1), generatedAt: z.iso.datetime(), serverUrl: z.url(), frontendUrl: z.url(),
    syndicatedServers: z.array(z.url()).max(1000),
    shards: z.array(z.object({ file: z.string().regex(SITEMAP_FILE_PATTERN), lastmod: z.iso.datetime(), count: z.number().int().min(1).max(MAX_SITEMAP_SHARD_URLS) })).max(MAX_SITEMAP_SHARDS),
}) satisfies z.ZodType<BackendSitemapManifest>;

export const buildSitemapXml = async (entries: SitemapItemLoose[]): Promise<string> => {
    return (await streamToPromise(Readable.from(entries).pipe(new SitemapStream()))).toString();
};

export const buildSitemapIndexXml = async (entries: IndexItem[]): Promise<string> => {
    if (entries.length > MAX_SITEMAP_INDEX_ENTRIES) {
        throw new Error("Sitemap index exceeds the protocol limit. No partial index was published.");
    }
    return (await streamToPromise(Readable.from(entries).pipe(new SitemapIndexStream()))).toString();
};

export const fetchBackendSitemapManifest = async (serverUrl: string, signal?: AbortSignal): Promise<BackendSitemapManifest> => {
    const normalizedUrl = normalizePublicBackendUrl(serverUrl);
    const response = await publicBackendFetch(`${normalizedUrl}/api/sitemaps`, { signal });
    if (!response.ok) {
        throw new Error(`Sitemap snapshot on ${normalizedUrl} is unavailable (HTTP ${response.status}).`);
    }
    const manifest = sitemapManifestSchema.parse(await response.json());
    if (normalizePublicBackendUrl(manifest.serverUrl) !== normalizedUrl) {
        throw new Error(`Sitemap source does not match ${normalizedUrl}.`);
    }
    return manifest;
};

export const buildSyndicatedSitemapIndex = async (): Promise<string> => {
    const root = getDefaultBackendUrl();
    const manifests = new Map<string, BackendSitemapManifest>();
    const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const discovery = await discoverBackends([root], async (serverUrl) => {
        const manifest = await fetchBackendSitemapManifest(serverUrl, signal);
        manifests.set(serverUrl, manifest);
        return { servers: manifest.syndicatedServers.map((url) => ({ serverUrl: url })) };
    }, signal);
    if (!manifests.has(root)) {
        throw new Error("Primary backend sitemap is unavailable or warming up. Retry shortly.");
    }
    if (discovery.failed.length || discovery.truncated) {
        console.warn("Sitemap backend discovery incomplete", discovery);
    }
    // Index entries point straight to URL sets; nested sitemap indexes are not valid.
    const entries = [...manifests.entries()].flatMap(([serverUrl, manifest]) => manifest.shards.map((shard) => ({
        url: `${SITE_URL}/sitemaps/${encodeServerUrlSegment(serverUrl)}/${shard.file}`,
        lastmod: shard.lastmod,
    })));
    return buildSitemapIndexXml([{ url: `${SITE_URL}/sitemaps/sections.xml` }, ...entries]);
};

export const fetchBackendSitemapShard = async (serverSegment: string, file: string): Promise<string> => {
    z.string().regex(SITEMAP_FILE_PATTERN).parse(file);
    z.string().min(2).max(4096).regex(/^(?:[a-fA-F0-9]{2})+$/).parse(serverSegment);
    const serverUrl = normalizePublicBackendUrl(decodeServerUrlSegment(serverSegment));
    const response = await publicBackendFetch(`${serverUrl}/api/sitemaps/${file}`);
    if (!response.ok) {
        throw new Error(`Sitemap shard unavailable (HTTP ${response.status}) on ${serverUrl}.`);
    }
    const xml = await response.text();
    const hash = createHash("sha256").update(xml).digest("hex");
    if (!file.endsWith(`-${hash}.xml`)) {
        throw new Error("Sitemap shard content does not match its immutable filename.");
    }
    const items = await parseSitemap(Readable.from([xml]));
    if (items.length > MAX_SITEMAP_SHARD_URLS) {
        throw new Error("Sitemap shard exceeds the URL limit.");
    }
    const collection = z.enum(["identities", "companies", "products", "jobs", "startups", "posts", "comments", "syndications"]).parse(file.split("-")[0]);
    const path = SITEMAP_COLLECTION_PATHS[collection];
    const entries = items.map((item) => {
        const parts = new URL(item.url).pathname.split("/");
        if (parts.length !== 4 || `/${parts[1]}` !== path || parts[3] !== encodeServerUrlSegment(serverUrl)) {
            throw new Error("Backend sitemap contains a URL outside its entity/source scope.");
        }
        const id = z.string().min(1).max(200).regex(/^[A-Za-z0-9_-]+$/).parse(parts[2]);
        // The same cached backend file can be used by more than one marketplace frontend.
        return { url: buildDetailUrl(path, id, serverUrl), lastmod: item.lastmod };
    });
    return buildSitemapXml(entries);
};

export const createSitemapProps = (render: (params: Record<string, string | string[] | undefined>) => Promise<string>): GetServerSideProps => {
    return async (context) => {
        const retryAfter = await checkRequestLimit(getClientRateLimitKey(context.req));
        const release = retryAfter ? null : await acquireRequestSlot();
        if (!release) {
            context.res.statusCode = retryAfter ? 429 : 503;
            context.res.setHeader("Cache-Control", "no-store");
            context.res.setHeader("Retry-After", String(retryAfter || 60));
            context.res.end("Sitemap temporarily unavailable.");
            return { props: {} };
        }
        try {
            const xml = await render(context.params || {});
            context.res.setHeader("Content-Type", "application/xml; charset=utf-8");
            context.res.setHeader("Cache-Control", "public, max-age=3600, stale-if-error=604800");
            context.res.setHeader("Content-Security-Policy", "default-src 'none'");
            context.res.setHeader("X-Content-Type-Options", "nosniff");
            context.res.end(xml);
        } catch (error) {
            console.error("Sitemap request failed", error);
            context.res.statusCode = error instanceof z.ZodError ? 400 : 503;
            context.res.setHeader("Cache-Control", "no-store");
            context.res.setHeader("Retry-After", "60");
            context.res.end("Sitemap unavailable. Retry shortly.");
        } finally {
            release();
        }
        return { props: {} };
    };
};

export const getRootSitemapProps = createSitemapProps(buildSyndicatedSitemapIndex);
export const getSectionSitemapProps = createSitemapProps(async () => buildSitemapXml(SITEMAP_SECTIONS.map((path) => ({ url: `${SITE_URL}${path}` }))));
export const getBackendSitemapProps = createSitemapProps(async (params) => {
    return fetchBackendSitemapShard(z.string().parse(params.server), z.string().parse(params.file));
});
