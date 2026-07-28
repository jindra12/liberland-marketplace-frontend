import type { Syndication } from "../../../../src/generated/graphql";

export const syndications: Syndication[] = [
    {
        id: "coop-syndication-main",
        name: "Co-op Main",
        description: "Primary cooperative syndicated content source",
        url: "http://127.0.0.1:3011",
        nsfw: false,
        autoEnable: true,
    },
];
