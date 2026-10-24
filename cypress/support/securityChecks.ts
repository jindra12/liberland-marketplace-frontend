import assert from "node:assert/strict";
import dns from "node:dns";
import { mock } from "node:test";
import { syncBuiltinESMExports } from "node:module";
import { setImmediate } from "node:timers/promises";
import { GuardedFetchErrorCode, isGuardedFetchError, isSafeIpAddress } from "guarded-fetch";
import { authorizationForBackend } from "../../src/mcp/backend";
import { discoverBackends } from "../../src/mcp/discovery";
import { addSyndicatedServer, listSyndicatedServers, removeSyndicatedServer } from "../../src/mcp/session";
import { acquireRequestSlot } from "../../src/server/security/limits";
import { normalizePublicBackendUrl, publicBackendFetch } from "../../src/server/security/utils";
import { DISCOVERY_CONCURRENCY, MAX_ACTIVE_REQUESTS, MAX_DISCOVERY_DEPTH, MAX_DISCOVERY_SERVERS, MAX_RESPONSE_BYTES, MAX_SESSIONS, MAX_SERVERS_PER_SESSION, SESSION_TTL_MS } from "../../src/server/security/constants";
import { fetchCompanyById } from "../../src/server/queries";
import { CompanyByIdDocument } from "../../src/generated/graphql";
import { securityRateChecks } from "./securityRateChecks";

export const securityChecks = {
    ...securityRateChecks,
    securityServerQueries: async () => {
        const lookup = mock.method(dns.promises, "lookup", async () => [{ address: "8.8.8.8", family: 4 }]);
        syncBuiltinESMExports();
        const fetchMock = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
            const request = new Request(input, init);
            assert.equal(request.url, "https://company.example/api/graphql");
            assert.equal(request.method, "POST");
            assert.equal(request.headers.get("Authorization"), null);
            assert.deepEqual(await request.json(), { query: CompanyByIdDocument, variables: { id: "company-id" } });
            return Response.json({ data: { Company: null } });
        });
        try {
            assert.deepEqual(await fetchCompanyById({ id: "company-id" }, "https://company.example"), { Company: null });
            await assert.rejects(fetchCompanyById({ id: "company-id" }, "https://127.0.0.1"), /public network addresses/);
            await assert.rejects(fetchCompanyById({ id: "company-id" }, "https://[::ffff:127.0.0.1]"), /public network addresses/);
            await assert.rejects(fetchCompanyById({ id: "company-id" }, "https://company.example?redirect=local"), /without credentials, queries, or fragments/);
            assert.equal(fetchMock.mock.callCount(), 1);
        } finally {
            fetchMock.mock.restore();
            lookup.mock.restore();
            syncBuiltinESMExports();
        }
        return true;
    },
    securityAddresses: () => {
        ["127.0.0.1", "10.0.0.1", "169.254.169.254", "100.64.0.1", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1"].forEach((value) => {
            assert.equal(isSafeIpAddress(value), false, value);
        });
        ["8.8.8.8", "2606:4700:4700::1111"].forEach((value) => assert.equal(isSafeIpAddress(value), true));
        ["https://127.0.0.1", "https://2130706433", "https://[::1]", "http://example.com", "https://user:pass@example.com", "https://example.com?secret=x"].forEach((value) => {
            assert.throws(() => normalizePublicBackendUrl(value));
        });
        assert.equal(normalizePublicBackendUrl("https://EXAMPLE.com/market/"), "https://example.com/market");
        return true;
    },
    securityDns: async () => {
        const lookup = mock.method(dns.promises, "lookup", async () => [
            { address: "8.8.8.8", family: 4 }, { address: "127.0.0.1", family: 4 },
        ]);
        syncBuiltinESMExports();
        try {
            await assert.rejects(publicBackendFetch("https://private-dns.example/api/graphql"), (error: Error) => {
                assert(isGuardedFetchError(error));
                assert.equal(error.code, GuardedFetchErrorCode.HOSTNAME_UNSAFE);
                return true;
            });
            assert.equal(lookup.mock.callCount(), 1);
        } finally {
            lookup.mock.restore();
            syncBuiltinESMExports();
        }
        return true;
    },
    securityResponseLimits: async () => {
        const lookup = mock.method(dns.promises, "lookup", async () => [{ address: "8.8.8.8", family: 4 }]);
        syncBuiltinESMExports();
        const fetchMock = mock.method(globalThis, "fetch", async (_input: string | URL | Request, init?: RequestInit) => {
            assert.equal(init?.redirect, "manual");
            assert(init?.signal);
            return new Response(new ReadableStream<Uint8Array>({
                start: (controller) => {
                    controller.enqueue(new Uint8Array(MAX_RESPONSE_BYTES + 1));
                    controller.close();
                },
            }));
        });
        try {
            await assert.rejects(publicBackendFetch("https://public.example/api/graphql"), (error: Error) => {
                assert(isGuardedFetchError(error));
                assert.equal(error.code, GuardedFetchErrorCode.RESPONSE_TOO_LARGE);
                return true;
            });
        } finally {
            fetchMock.mock.restore();
            lookup.mock.restore();
            syncBuiltinESMExports();
        }
        return true;
    },
    securityTokenScope: () => {
        const authorization = { value: "Bearer test-secret", serverUrl: "https://one.example" };
        assert.equal(authorizationForBackend(authorization, "https://one.example/"), authorization.value);
        assert.equal(authorizationForBackend(authorization, "https://two.example"), undefined);
        assert.equal(authorizationForBackend(undefined, "https://one.example"), undefined);
        return true;
    },
    securityDiscovery: async () => {
        const query = mock.fn(async () => {
            return { servers: Array.from({ length: 100 }, (_, index) => ({ serverUrl: `https://server-${index}.example` })) };
        });
        const result = await discoverBackends(["https://root.example"], query, AbortSignal.timeout(5000));
        assert.equal(query.mock.callCount(), MAX_DISCOVERY_SERVERS);
        assert.equal(result.servers.length, MAX_DISCOVERY_SERVERS);
        assert.equal(result.truncated, true);
        const cycle = await discoverBackends(["https://root.example"], async () => ({
            servers: [{ serverUrl: "https://root.example" }],
        }), AbortSignal.timeout(5000));
        assert.deepEqual(cycle.servers, ["https://root.example"]);
        assert.equal(cycle.truncated, false);

        const directory = mock.fn(async (serverUrl: string) => {
            if (serverUrl === "https://down.example") {
                throw new Error("Backend is down.");
            }
            return { servers: [] };
        });
        const partial = await discoverBackends([
            "https://ROOT.example/", "https://root.example", "https://127.0.0.1", "https://down.example",
        ], directory, AbortSignal.timeout(5000));
        assert.deepEqual(partial.servers, ["https://root.example"]);
        assert.equal(partial.failed.length, 2);
        assert.equal(directory.mock.callCount(), 2);
        assert.equal(partial.truncated, false);

        const deep = await discoverBackends(["https://root.example"], async (serverUrl) => ({
            servers: [{ serverUrl: `${serverUrl}/child` }],
        }), AbortSignal.timeout(5000));
        assert.equal(deep.servers.length, MAX_DISCOVERY_DEPTH + 1);
        assert.equal(deep.truncated, true);

        const cancelled = await discoverBackends(["https://root.example"], directory, AbortSignal.abort());
        assert.deepEqual(cancelled.servers, []);
        assert.equal(cancelled.truncated, true);
        assert.equal(directory.mock.callCount(), 2);

        const gate = Promise.withResolvers<void>();
        const concurrentQuery = mock.fn(async () => {
            await gate.promise;
            return { servers: [] };
        });
        const concurrent = discoverBackends(
            Array.from({ length: DISCOVERY_CONCURRENCY + 2 }, (_, index) => `https://parallel-${index}.example`),
            concurrentQuery,
            AbortSignal.timeout(5000),
        );
        await setImmediate();
        assert.equal(concurrentQuery.mock.callCount(), DISCOVERY_CONCURRENCY);
        gate.resolve();
        assert.equal((await concurrent).servers.length, DISCOVERY_CONCURRENCY + 2);
        return true;
    },
    securitySessions: () => {
        Array.from({ length: 1000 }, (_, index) => listSyndicatedServers(`read-only-${index}`));
        Array.from({ length: MAX_SESSIONS }, (_, index) => {
            assert.deepEqual(addSyndicatedServer(`test-${index}`, "https://public.example"), ["https://public.example"]);
        });
        assert.throws(() => addSyndicatedServer("one-too-many", "https://public.example"), /cache is full/);
        Array.from({ length: MAX_SERVERS_PER_SESSION - 1 }, (_, index) => {
            addSyndicatedServer("test-0", `https://extra-${index}.example`);
        });
        assert.throws(() => addSyndicatedServer("test-0", "https://overflow.example"), /at most/);
        assert.equal(removeSyndicatedServer("test-0", "https://public.example").length, MAX_SERVERS_PER_SESSION - 1);
        let future = Date.now() + SESSION_TTL_MS + 1;
        const clock = mock.method(Date, "now", () => future);
        try {
            assert.deepEqual(listSyndicatedServers("test-1"), []);
            assert.deepEqual(addSyndicatedServer("fresh", "https://public.example"), ["https://public.example"]);
        } finally {
            future += SESSION_TTL_MS + 1;
            listSyndicatedServers("fresh");
            clock.mock.restore();
        }
        return true;
    },
    securityConcurrency: async () => {
        const releases = await Promise.all(Array.from({ length: MAX_ACTIVE_REQUESTS }, () => acquireRequestSlot()));
        try {
            assert(releases.every(Boolean));
            assert.equal(await acquireRequestSlot(), null);
        } finally {
            releases.forEach((release) => {
                release?.();
                release?.();
            });
        }
        const release = await acquireRequestSlot();
        assert(release);
        release();
        return true;
    },
};
