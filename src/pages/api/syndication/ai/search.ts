import type { NextApiRequest, NextApiResponse } from "next";

import { BACKEND_URL } from "../../../../gqlFetcher";

type ProxyRequest = {
    query: string;
    serverUrls: string[];
    limit?: number;
};

type BackendSource = {
    collection: string;
    id: string;
    title: string;
    slug: string | null;
    serverUrl: string;
};

type BackendResponse = {
    answer: string;
    sources: BackendSource[];
};

type BackendErrorResponse = { error?: string };

type ProxyResult = {
    serverUrl: string;
    answer?: string;
    sources: BackendSource[];
    error?: string;
};

type ProxyResponse = {
    results: ProxyResult[];
    sources: BackendSource[];
};

const MAX_SERVER_COUNT = 8;
const MAX_QUERY_LENGTH = 600;

const isPrivateHostname = (hostname: string): boolean => {
    const normalizedHostname = hostname.toLowerCase();

    return (
        normalizedHostname === "localhost" ||
        normalizedHostname === "::1" ||
        normalizedHostname.endsWith(".local") ||
        normalizedHostname.startsWith("127.") ||
        normalizedHostname.startsWith("10.") ||
        normalizedHostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalizedHostname)
    );
};

const normalizeServerUrl = (value: string): string => {
    const parsed = new URL(value);

    if (parsed.protocol !== "https:" || isPrivateHostname(parsed.hostname)) {
        throw new Error("Syndicated backends must use a public HTTPS URL.");
    }

    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/+$/, "");
};

const parseRequest = (body: { query?: unknown; q?: unknown; serverUrl?: unknown; serverUrls?: unknown; limit?: unknown }): ProxyRequest => {
    const query = typeof body.query === "string" ? body.query : body.q;
    const listedServerUrls = Array.isArray(body.serverUrls)
        ? body.serverUrls
        : typeof body.serverUrls === "string"
          ? body.serverUrls.split(",")
          : [];
    const serverUrls = [
        ...(typeof body.serverUrl === "string" ? [body.serverUrl] : []),
        ...listedServerUrls.filter((value): value is string => typeof value === "string"),
    ];

    if (typeof query !== "string" || query.length === 0 || query.length > MAX_QUERY_LENGTH) {
        throw new Error(`Query must contain between 1 and ${MAX_QUERY_LENGTH} characters.`);
    }

    if (serverUrls.length > MAX_SERVER_COUNT) {
        throw new Error(`Provide no more than ${MAX_SERVER_COUNT} syndicated backend URLs.`);
    }

    return {
        query,
        serverUrls: Array.from(new Set((serverUrls.length > 0 ? serverUrls : [BACKEND_URL]).map(normalizeServerUrl))),
        limit: typeof body.limit === "number" ? body.limit : undefined,
    };
};

const queryBackend = async (serverUrl: string, body: ProxyRequest, authorization?: string): Promise<ProxyResult> => {
    const headers: HeadersInit = { "Content-Type": "application/json" };

    if (authorization) {
        headers.Authorization = authorization;
    }

    const searchUrl = new URL(`${serverUrl}/api/ai/search`);
    searchUrl.searchParams.set("query", body.query);
    if (body.limit !== undefined) {
        searchUrl.searchParams.set("limit", String(body.limit));
    }

    const response = await fetch(searchUrl, { method: "GET", headers });

    const result = (await response.json()) as BackendResponse | BackendErrorResponse;

    if (!response.ok || !("answer" in result) || !("sources" in result)) {
        const message = "error" in result && result.error ? result.error : `Backend responded with status ${response.status}.`;
        throw new Error(`The syndicated backend rejected the AI search: ${message}`);
    }

    return { serverUrl, answer: result.answer, sources: result.sources };
};

const handler = async (
    request: NextApiRequest,
    response: NextApiResponse<ProxyResponse | { error: string }>,
): Promise<void> => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
        response.status(204).end();
        return;
    }

    if (request.method !== "GET" && request.method !== "POST") {
        response.setHeader("Allow", "GET, POST, OPTIONS");
        response.status(405).json({ error: "Method not allowed." });
        return;
    }

    try {
        const body = request.method === "GET"
            ? parseRequest({
                  query: request.query.query,
                  q: request.query.q,
                  serverUrl: request.query.serverUrl,
                  serverUrls: request.query.serverUrls,
                  limit: request.query.limit ? Number(request.query.limit) : undefined,
              })
            : parseRequest(request.body as ProxyRequest);
        const authorization = typeof request.headers.authorization === "string" ? request.headers.authorization : undefined;
        const settledResults = await Promise.allSettled(
            body.serverUrls.map(async (serverUrl) => queryBackend(serverUrl, body, authorization)),
        );
        const results = settledResults.map((settledResult, index) => {
            const serverUrl = body.serverUrls[index];

            if (settledResult.status === "fulfilled") {
                return settledResult.value;
            }

            return {
                serverUrl,
                sources: [],
                error: settledResult.reason instanceof Error ? settledResult.reason.message : "Backend unavailable.",
            };
        });
        const sources = Array.from(
            new Map(
                results
                    .flatMap((result) => result.sources)
                    .map((source) => [`${source.serverUrl}:${source.collection}:${source.id}`, source]),
            ).values(),
        );

        response.status(200).json({ results, sources });
    } catch (error) {
        response.status(400).json({ error: error instanceof Error ? error.message : "Invalid AI search request." });
    }
};

// Next Pages API routes require a default handler export.
// eslint-disable-next-line import/no-default-export
export default handler;
