import { normalizeBackendUrl } from "./backend";
import { DISCOVERY_CONCURRENCY, MAX_DISCOVERY_DEPTH, MAX_DISCOVERY_SERVERS } from "../server/security/constants";
import type { BackendDirectory, DiscoveryBranch, DiscoveryEntry, DiscoveryFailure, DiscoveryResult, DiscoveryState } from "./types";

const normalizeEntry = (entry: DiscoveryEntry): DiscoveryEntry | DiscoveryFailure => {
    try {
        return { ...entry, serverUrl: normalizeBackendUrl(entry.serverUrl) };
    } catch (error) {
        return { serverUrl: entry.serverUrl, error: error instanceof Error ? error.message : "Invalid backend URL." };
    }
};

const readDirectory = async (
    entry: DiscoveryEntry,
    queryDirectory: (serverUrl: string) => Promise<BackendDirectory>,
): Promise<DiscoveryBranch> => {
    try {
        const response = await queryDirectory(entry.serverUrl);
        const listed = response.servers ?? [];
        const depthLimitReached = entry.depth >= MAX_DISCOVERY_DEPTH;
        return {
            servers: [entry.serverUrl],
            failed: [],
            pending: depthLimitReached ? [] : listed.slice(0, MAX_DISCOVERY_SERVERS).map((child) => ({
                serverUrl: child.serverUrl,
                depth: entry.depth + 1,
            })),
            truncated: listed.length > MAX_DISCOVERY_SERVERS || (depthLimitReached && listed.length > 0),
        };
    } catch (error) {
        return {
            servers: [],
            failed: [{ serverUrl: entry.serverUrl, error: error instanceof Error ? error.message : "Backend discovery failed." }],
            pending: [],
            truncated: false,
        };
    }
};

export const discoverBackends = async (
    roots: string[],
    queryDirectory: (serverUrl: string) => Promise<BackendDirectory>,
    signal: AbortSignal,
): Promise<DiscoveryResult> => {
    const traverse = async (state: DiscoveryState): Promise<DiscoveryResult> => {
        const normalized = state.pending.map(normalizeEntry);
        const failed = [...state.failed, ...normalized.filter((entry): entry is DiscoveryFailure => "error" in entry)];
        const pending = normalized
            .filter((entry): entry is DiscoveryEntry => "depth" in entry)
            .filter((entry, index, entries) => !state.visited.includes(entry.serverUrl)
                && entries.findIndex((candidate) => candidate.serverUrl === entry.serverUrl) === index);
        const remainingCapacity = MAX_DISCOVERY_SERVERS - state.visited.length;

        if (!pending.length || !remainingCapacity || signal.aborted) {
            return {
                servers: state.servers,
                failed,
                truncated: state.truncated || pending.length > 0 || signal.aborted,
            };
        }

        const batch = pending.slice(0, Math.min(DISCOVERY_CONCURRENCY, remainingCapacity));
        const branches = await Promise.all(batch.map((entry) => readDirectory(entry, queryDirectory)));
        return traverse({
            pending: [...pending.slice(batch.length), ...branches.flatMap((branch) => branch.pending)],
            visited: [...state.visited, ...batch.map((entry) => entry.serverUrl)],
            servers: [...state.servers, ...branches.flatMap((branch) => branch.servers)],
            failed: [...failed, ...branches.flatMap((branch) => branch.failed)],
            truncated: state.truncated || branches.some((branch) => branch.truncated),
        });
    };

    return traverse({
        pending: roots.map((serverUrl) => ({ serverUrl, depth: 0 })),
        visited: [],
        servers: [],
        failed: [],
        truncated: false,
    });
};
