export const PUBLIC_MARKETPLACE_ENTITIES = [
    "companies",
    "products",
    "jobs",
    "ventures",
    "identities",
    "posts",
    "comments",
    "media",
    "syndications",
] as const;

export const PUBLIC_MARKETPLACE_TOOLS = {
    list: "list_entities",
    search: "search_entities",
    get: "get_entity",
    related: "find_related_entities",
    compare: "compare_products",
    schema: "describe_entity_schema",
    backend: "describe_backend",
    servers: "discover_syndicated_servers",
} as const;

export const MAX_PUBLIC_BACKENDS = 8;
