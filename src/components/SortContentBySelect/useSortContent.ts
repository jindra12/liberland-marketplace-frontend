import * as React from "react";

import useLocalStorage from "use-local-storage";
import { useQueryClient } from "@tanstack/react-query";

import { SORT_CONTENT_BY_STORAGE_KEY } from "./constants";
import type { SortContentByOption } from "./types";

export const useSortContent = () => {
    const queryClient = useQueryClient();
    const [value, setValue] = useLocalStorage<SortContentByOption>(SORT_CONTENT_BY_STORAGE_KEY, "-contentRankScore");
    const didMountRef = React.useRef(false);

    React.useEffect(() => {
        if (didMountRef.current) {
            queryClient.invalidateQueries();
            return;
        }

        didMountRef.current = true;
    }, [queryClient, value]);

    const setSortContent = (nextValue: SortContentByOption) => {
        localStorage.setItem(SORT_CONTENT_BY_STORAGE_KEY, JSON.stringify(nextValue));
        setValue(nextValue);
    };

    return [value, setSortContent] as const;
};
