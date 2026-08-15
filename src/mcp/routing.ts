import { normalizeBackendUrl } from "./backend";
import { listSyndicatedServers } from "./session";

export const getDefaultBackendUrl = (): string => {
    const value = process.env.REACT_APP_BACKEND_URL;
    if (!value) throw new Error("REACT_APP_BACKEND_URL is required for MCP backend routing.");
    return normalizeBackendUrl(value);
};

export const resolveBackendUrl = (serverUrl?: string): string => normalizeBackendUrl(serverUrl || getDefaultBackendUrl());

export const resolveSessionServers = (authorization: string | undefined, serverUrl?: string): string[] => {
    if (serverUrl) return [resolveBackendUrl(serverUrl)];
    return Array.from(new Set([getDefaultBackendUrl(), ...listSyndicatedServers(authorization)]));
};
