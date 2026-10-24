import { isIP } from "node:net";
import { guardedFetch, isSafeIpAddress, readBodyAsText } from "guarded-fetch";
import { BACKEND_TIMEOUT_MS, MAX_BACKEND_URL_LENGTH, MAX_RESPONSE_BYTES } from "./constants";

export const normalizePublicBackendUrl = (value: string): string => {
    if (value.length > MAX_BACKEND_URL_LENGTH) {
        throw new Error("The backend URL is too long.");
    }

    const parsed = new URL(value);
    const hostname = parsed.hostname.startsWith("[") ? parsed.hostname.slice(1, -1) : parsed.hostname;
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) {
        throw new Error("Backends must use HTTPS URLs without credentials, queries, or fragments.");
    }
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
        throw new Error("Backends must use public network addresses.");
    }
    if (isIP(hostname) && !isSafeIpAddress(hostname)) {
        throw new Error("Backends must use public network addresses.");
    }

    return parsed.toString().replace(/\/+$/, "");
};


export const publicBackendFetch: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    const deadlineAt = Date.now() + BACKEND_TIMEOUT_MS;
    const response = await guardedFetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? await request.arrayBuffer() : undefined,
        signal: request.signal,
        httpsOnly: true,
        followRedirects: false,
        timeoutMs: BACKEND_TIMEOUT_MS,
        fetch,
    });
    const body = await readBodyAsText(response, { maxResponseBytes: MAX_RESPONSE_BYTES, deadlineAt });
    return new Response(response.body ? body : null, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
};
