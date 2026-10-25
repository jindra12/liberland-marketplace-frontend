import type { TRIBE_ENTITIES } from "./constants";

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

export type TribeListingItem = {
    id: string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    serverURL?: string | null;
};

export type TribeListing = {
    docs: TribeListingItem[];
    totalDocs: number;
    hasNextPage: boolean;
};
