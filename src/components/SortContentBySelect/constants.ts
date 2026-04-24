import type { SortContentBySelectOption } from "./types";

export const SORT_CONTENT_BY_STORAGE_KEY = "AppHeader.sortContentBy";

export const sortContentOptions: SortContentBySelectOption[] = [
    {
        value: "-contentRankScore",
        label: "Hot",
    },
    {
        value: "-likeCount",
        label: "Top",
    },
    {
        value: "-createdAt",
        label: "New",
    },
];
