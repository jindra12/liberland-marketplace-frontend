import type { Syndication } from "../../../../src/generated/graphql";

export const syndications: Syndication[] = [
    {
        id: "syndication-main",
        name: "Main",
        description: "Primary syndicated content source",
        url: "http://127.0.0.1:3010",
        enabled: true,
    },
    {
        id: "syndication-coop",
        name: "Co-op",
        description: "Cooperative marketplace server",
        url: "http://127.0.0.1:3011",
        enabled: true,
    },
];
