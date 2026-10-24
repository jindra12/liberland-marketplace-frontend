export const MCP_ENTITIES = [
    "companies",
    "products",
    "jobs",
    "ventures",
    "identities",
    "posts",
    "comments",
    "orders",
    "carts",
    "users",
    "media",
    "syndications",
    "reports",
    "information-requests",
    "notification-subscriptions",
    "subscribers",
] as const;

export type BackendAuthorization = {
    value: string;
    serverUrl: string;
};

export type BackendDirectory = { servers?: Array<{ serverUrl: string }> };

export type DiscoveryEntry = { serverUrl: string; depth: number };
export type DiscoveryFailure = { serverUrl: string; error: string };
export type DiscoveryResult = { servers: string[]; failed: DiscoveryFailure[]; truncated: boolean };
export type DiscoveryBranch = DiscoveryResult & { pending: DiscoveryEntry[] };
export type DiscoveryState = DiscoveryBranch & { visited: string[] };
