import type { DefaultOptions } from "@tanstack/react-query";

export const MARKETPLACE_QUERY_DEFAULTS: DefaultOptions = {
    queries: {
        staleTime: 30000,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    },
};
