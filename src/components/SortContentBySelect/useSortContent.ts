import useLocalStorage from "use-local-storage";

import { SORT_CONTENT_BY_STORAGE_KEY } from "./constants";
import type { SortContentByOption } from "./types";

export const useSortContent = () => {
    const [value, setValue] = useLocalStorage<SortContentByOption>(SORT_CONTENT_BY_STORAGE_KEY, "-contentRankScore");

    return [value, setValue] as const;
};
