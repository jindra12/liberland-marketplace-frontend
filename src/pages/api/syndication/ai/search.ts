import type { NextApiRequest, NextApiResponse } from "next";

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

const parseRequest = (body: ProxyRequest): ProxyRequest => {
    if (!Array.isArray(body.serverUrls) || body.serverUrls.length === 0 || body.serverUrls.length > MAX_SERVER_COUNT) {
        throw new Error(`Provide between 1 and ${MAX_SERVER_COUNT} syndicated backend URLs.`);
    }

    if (typeof body.query !== "string" || body.query.length === 0 || body.query.length > MAX_QUERY_LENGTH) {
        throw new Error(`Query must contain between 1 and ${MAX_QUERY_LENGTH} characters.`);
    }

    return {
        query: body.query,
        serverUrls: Array.from(new Set(body.serverUrls.map(normalizeServerUrl))),
        limit: body.limit,
    };
};

const queryBackend = async (serverUrl: string, body: ProxyRequest, authorization?: string): Promise<ProxyResult> => {
    const headers: HeadersInit = { "Content-Type": "application/json" };

    if (authorization) {
        headers.Authorization = authorization;
    }

    const response = await fetch(`${serverUrl}/api/ai/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: body.query, limit: body.limit }),
    });

    const result = (await response.json()) as BackendResponse | { error?: string };

    if (!response.ok || !("answer" in result) || !("sources" in result)) {
        throw new Error("The syndicated backend rejected the AI search.");
    }

    return { serverUrl, answer: result.answer, sources: result.sources };
};

const handler = async (
    request: NextApiRequest,
    response: NextApiResponse<ProxyResponse | { error: string }>,
): Promise<void> => {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        response.status(405).json({ error: "Method not allowed." });
        return;
    }

    try {
        const body = parseRequest(request.body as ProxyRequest);
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
