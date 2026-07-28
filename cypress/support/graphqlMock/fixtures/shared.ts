import type { MockCollection } from "../types";
import type { Media } from "../../../../src/generated/graphql";
import { buildMockImageNode } from "../imageAssets";

export const MAIN_SYNDICATION_URL = "http://127.0.0.1:3010";
export const COOP_SYNDICATION_URL = "http://127.0.0.1:3011";
export const GUEST_SYNDICATION_URL = "http://127.0.0.1:3012";

export const image = (id: string, alt: string): Media =>
    buildMockImageNode(id, alt, id.startsWith("post-") || id.startsWith("coop-post-") || id.startsWith("guest-post-") ? "hero" : "avatar");

export const collection = <T>(docs: T[]): MockCollection<T> => ({
    docs,
    totalDocs: docs.length,
    limit: docs.length,
    totalPages: 1,
    page: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
});
