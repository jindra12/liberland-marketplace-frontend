import type { Options } from "normalize-url";

export const MAX_REQUEST_BYTES = 256 * 1024;
export const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
export const MAX_TOOL_INPUT_ELEMENTS = 2000;
export const BACKEND_TIMEOUT_MS = 15000;
export const REQUEST_TIMEOUT_MS = 30000;
export const MAX_ACTIVE_REQUESTS = 16;
export const MAX_BACKEND_URL_LENGTH = 2048;
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_SESSIONS = 256;
export const MAX_SERVERS_PER_SESSION = 16;
export const MAX_DISCOVERY_SERVERS = 32;
export const MAX_DISCOVERY_DEPTH = 3;
export const DISCOVERY_CONCURRENCY = 4;
export const BACKEND_URL_NORMALIZATION_OPTIONS: Options = {
    stripWWW: false,
    stripAuthentication: false,
    stripHash: false,
    stripTextFragment: false,
    removeQueryParameters: [],
    sortQueryParameters: false,
};
export const GLOBAL_REQUESTS_PER_MINUTE = 1200;
export const CLIENT_REQUESTS_PER_MINUTE = 120;
export const CLIENT_RAG_SEARCHES_PER_HOUR = 40;
export const GLOBAL_RAG_SEARCHES_PER_HOUR = 400;
