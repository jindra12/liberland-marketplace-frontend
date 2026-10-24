import { isIP } from "node:net";
import { guardedFetch, isSafeIpAddress, readBodyAsText } from "guarded-fetch";
import normalizeUrl from "normalize-url";
import { z } from "zod";
import { BACKEND_TIMEOUT_MS, BACKEND_URL_NORMALIZATION_OPTIONS, MAX_BACKEND_URL_LENGTH, MAX_RESPONSE_BYTES } from "./constants";

const backendUrlSchema = z.url({ protocol: /^https$/ }).max(MAX_BACKEND_URL_LENGTH)
    .transform((value) => new URL(value))
    .refine((url) => !url.username && !url.password && !url.search && !url.hash, {
        message: "Backends must use HTTPS URLs without credentials, queries, or fragments.",
    })
    .refine((url) => {
        const hostname = url.hostname.startsWith("[") ? url.hostname.slice(1, -1) : url.hostname;
        return hostname !== "localhost" && !hostname.endsWith(".localhost") && !hostname.endsWith(".local")
            && (!isIP(hostname) || isSafeIpAddress(hostname));
    }, { message: "Backends must use public network addresses." });

export const normalizePublicBackendUrl = (value: string): string => {
    return normalizeUrl(backendUrlSchema.parse(value).href, BACKEND_URL_NORMALIZATION_OPTIONS);
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
