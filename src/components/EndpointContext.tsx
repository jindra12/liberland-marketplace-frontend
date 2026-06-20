import * as React from "react";

import { useQueries } from "@tanstack/react-query";

import useLocalStorage from "use-local-storage";

import {
    useListPublishedSyndicationUrlsQuery,
    ListPublishedSyndicationUrlsQueryVariables,
    ListPublishedSyndicationUrlsQuery,
    ListPublishedSyndicationUrlsDocument,
} from "../generated/graphql";
import { gqlFetcher } from "../gqlFetcher";
import { URL } from "../types";

import type { EndpointPendingAction } from "./EndpointAuthAction/types";
import { AUTH_URL_STORAGE_KEY } from "./endpoints/constants";
import { getDefaultEndpointUrls, mergeSyndicationUrls } from "./endpoints/utils";
import { combineResult, deepMergeConcatArrays } from "./query/utils";

export interface EndpointContextType {
    urls: URL[];
    enabled: string[];
    isSyndicationLoading: boolean;
    setUrls: (urls: URL[] | ((urls?: URL[]) => URL[])) => void;
    authUrl: string;
    setAuthUrl: (auth: string) => void;
    pendingAction?: EndpointPendingAction;
    setPendingAction: React.Dispatch<React.SetStateAction<EndpointPendingAction | undefined>>;
}

const EndpointContext = React.createContext<EndpointContextType>(null!);
const defaultUrls: URL[] = getDefaultEndpointUrls();

export const useSyndicationQuery = (urls: URL[], setUrls: (urls: ((prev?: URL[]) => URL[]) | URL[]) => void) => {
    const queries = useQueries({
        queries: urls.map((url) => ({
            queryKey: [...useListPublishedSyndicationUrlsQuery.getKey({}), url.value],
            queryFn: gqlFetcher<ListPublishedSyndicationUrlsQuery, ListPublishedSyndicationUrlsQueryVariables>(
                ListPublishedSyndicationUrlsDocument,
                {},
                undefined,
                url.value,
            ),
        })),
        combine: (result) => combineResult(result, deepMergeConcatArrays),
    });
    React.useEffect(() => {
        setUrls((maybeUrls) => mergeSyndicationUrls(maybeUrls, queries.data?.Syndications?.docs || []));
    }, [queries.data, setUrls]);

    return queries;
};

export const EndpointContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [storedUrls, setUrls] = useLocalStorage<URL[]>("endpoints.urls", defaultUrls);
    const [storedAuthUrl, setAuthUrl] = useLocalStorage<string>(AUTH_URL_STORAGE_KEY, defaultUrls[0].value);
    const [pendingAction, setPendingAction] = React.useState<EndpointPendingAction>();
    const urls = React.useMemo(() => {
        if (!Array.isArray(storedUrls) || storedUrls.length === 0) {
            return defaultUrls;
        }
        return storedUrls;
    }, [storedUrls]);
    const authUrl = React.useMemo(() => {
        if (urls.some((entry) => entry.value === storedAuthUrl)) {
            return storedAuthUrl;
        }

        return urls[0].value;
    }, [storedAuthUrl, urls]);
    const enabled = React.useMemo(() => urls.filter(({ enabled }) => enabled).map(({ value }) => value), [urls]);
    const syndicationQuery = useSyndicationQuery(urls, setUrls);

    return (
        <EndpointContext.Provider
            value={{
                setUrls,
                urls,
                enabled,
                authUrl,
                setAuthUrl,
                pendingAction,
                setPendingAction,
                isSyndicationLoading: syndicationQuery.isLoading,
            }}
        >
            {props.children}
        </EndpointContext.Provider>
    );
};

export const useEndpointContext = () => React.useContext(EndpointContext);
