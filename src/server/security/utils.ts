import { isIP } from "node:net";
import {
    GuardedFetchError,
    GuardedFetchErrorCode,
    guardedFetch,
    isSafeIpAddress,
    OPAQUE_ERROR_MESSAGE,
} from "guarded-fetch";
import normalizeUrl from "normalize-url";
import { z } from "zod";
import {
    BACKEND_TIMEOUT_MS,
    BACKEND_URL_NORMALIZATION_OPTIONS,
    MAX_BACKEND_URL_LENGTH,
    MAX_RESPONSE_BYTES,
} from "./constants";

const backendUrlSchema = z
    .url({ protocol: /^https$/ })
    .max(MAX_BACKEND_URL_LENGTH)
    .transform((value) => new URL(value))
    .refine((url) => !url.username && !url.password && !url.search && !url.hash, {
        message: "Backends must use HTTPS URLs without credentials, queries, or fragments.",
    })
    .refine(
        (url) => {
            const hostname = url.hostname.startsWith("[") ? url.hostname.slice(1, -1) : url.hostname;
            return (
                hostname !== "localhost" &&
                !hostname.endsWith(".localhost") &&
                !hostname.endsWith(".local") &&
                (!isIP(hostname) || isSafeIpAddress(hostname))
            );
        },
        { message: "Backends must use public network addresses." },
    );

export const normalizePublicBackendUrl = (value: string): string => {
    return normalizeUrl(backendUrlSchema.parse(value).href, BACKEND_URL_NORMALIZATION_OPTIONS);
};

export const publicBackendFetch: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(BACKEND_TIMEOUT_MS)]);
    const response = await guardedFetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? await request.arrayBuffer() : undefined,
        signal,
        httpsOnly: true,
        followRedirects: false,
        timeoutMs: BACKEND_TIMEOUT_MS,
        opaqueErrors: true,
        fetch,
    });
    const received = { bytes: 0 };
    const body = response.body?.pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
            transform: (chunk, controller) => {
                received.bytes += chunk.byteLength;
                if (received.bytes > MAX_RESPONSE_BYTES) {
                    controller.error(
                        new GuardedFetchError(GuardedFetchErrorCode.RESPONSE_TOO_LARGE, OPAQUE_ERROR_MESSAGE),
                    );
                    return;
                }
                controller.enqueue(chunk);
            },
        }),
        { signal },
    );
    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
};
