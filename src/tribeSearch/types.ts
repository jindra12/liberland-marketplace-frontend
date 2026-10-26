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
};

export type TribeListingItem = MetadataProduct & {
    id: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    serverURL?: string | null;
    company?: MetadataCompany | null;
    identity?: MetadataTribe | null;
};

export type TribeListing = {
    docs: TribeListingItem[];
    totalDocs: number;
    hasNextPage: boolean;
};
