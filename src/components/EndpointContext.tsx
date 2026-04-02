import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import useLocalStorage from "use-local-storage";
import { useListPublishedSyndicationUrlsQuery, ListPublishedSyndicationUrlsQueryVariables, ListPublishedSyndicationUrlsQuery, ListPublishedSyndicationUrlsDocument } from "../generated/graphql";
import { BACKEND_URL, gqlFetcher } from "../gqlFetcher";
import { URL } from "../types";
import { mergeSyndicationUrls } from "./endpoints/utils";
import { combineResult, deepMergeConcatArrays } from "./query/utils";

export interface EndpointContextType {
    urls: URL[];
    enabled: string[];
    setUrls: (urls: URL[] | ((urls?: URL[]) => URL[])) => void;
    authUrl: string;
    setAuthUrl: (auth: string) => void;
}

const EndpointContext = React.createContext<EndpointContextType>(null!);
const defaultUrls: URL[] = [{ enabled: true, value: BACKEND_URL, name: "Main" }];

export const useSyndicationQuery = (urls: URL[], setUrls: (urls: ((prev?: URL[]) => URL[]) | URL[]) => void) => {
    const queries = useQueries({
        queries: urls.map((url) => ({
            queryKey: [...useListPublishedSyndicationUrlsQuery.getKey({}), url.value],
            queryFn: gqlFetcher<ListPublishedSyndicationUrlsQuery, ListPublishedSyndicationUrlsQueryVariables>(ListPublishedSyndicationUrlsDocument, {}, undefined, url.value),
        })),
        combine: (result) => {
            return combineResult(result, deepMergeConcatArrays);
        },
    });
    React.useEffect(() => {
        setUrls((maybeUrls) => mergeSyndicationUrls(maybeUrls, queries.data?.Syndications?.docs || []));
    }, [queries.data, setUrls]);

    return queries;
};

export const EndpointContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [storedUrls, setUrls] = useLocalStorage<URL[]>("endpoints.urls", defaultUrls);
    const urls = React.useMemo(() => {
        if (!Array.isArray(storedUrls) || storedUrls.length === 0) {
            return defaultUrls;
        }
        return storedUrls;
    }, [storedUrls]);
    const [authUrl, setAuthUrl] = React.useState<string>(urls[0].value);
    const enabled = React.useMemo(() => urls.filter(({ enabled }) => enabled).map(({ value }) => value), [urls]);
    useSyndicationQuery(urls, setUrls);

    return <EndpointContext.Provider value={{ setUrls, urls, enabled, authUrl, setAuthUrl }}>{props.children}</EndpointContext.Provider>;
};

export const useEndpointContext = () => React.useContext(EndpointContext);
