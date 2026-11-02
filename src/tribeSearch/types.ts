import type { TRIBE_ENTITIES } from "./constants";
import type { MetadataCompany, MetadataProduct, MetadataTribe } from "../detailMetadata/types";

export type TribeEntity = typeof TRIBE_ENTITIES[number];

export type TribeReference = { id: string; name: string };

export type TribeSearchInput = {
    entity: TribeEntity;
    tribe?: string;
    tribeId?: string;
    serverUrl?: string;
    page: number;
    limit: number;
    q?: string;
    format?: "json" | "jsonld";
};

export type TribeListingItem = MetadataProduct & {
    id: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    serverURL?: string | null;
    company?: MetadataCompany | null;
    identity?: MetadataTribe | null;
    website?: string | null;
    services?: Array<{ id: string; name: string; description: string; url: string }>;
};

export type TribeSearchResult = {
    input: TribeSearchInput;
    tribe: TribeReference;
    serverUrl: string;
    listing: TribeListing;
};

export class TribeSearchError extends Error {
    constructor(public status: number, public code: string, message: string) {
        super(message);
    }
}

export type TribeListing = {
    docs: TribeListingItem[];
    totalDocs: number;
    hasNextPage: boolean;
};
