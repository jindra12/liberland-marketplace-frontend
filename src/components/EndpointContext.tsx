import * as React from "react";
import {
    useQueries,
} from "@tanstack/react-query";
import {
    useListPublishedSyndicationUrlsQuery,
    ListPublishedSyndicationUrlsQueryVariables,
    ListPublishedSyndicationUrlsQuery,
    ListPublishedSyndicationUrlsDocument,
} from "../generated/graphql";
import { BACKEND_URL, gqlFetcher } from "../gqlFetcher";
import { URL } from "../types";
import { combineResult, deepMergeConcatArrays } from "../utils";

export interface EndpointContextType {
    urls: URL[];
    enabled: string[];
    setUrls: (urls: URL[] | ((urls: URL[]) => URL[])) => void;
    authUrl: string;
    setAuthUrl: (auth: string) => void;
}

const EndpointContext = React.createContext<EndpointContextType>(null!);

export const useSyndicationQuery = (urls: URL[], setUrls: (urls: ((prev: URL[]) => URL[]) | URL[]) => void) => {
    const queries = useQueries({
        queries: urls.map(url => ({
            queryKey: [...useListPublishedSyndicationUrlsQuery.getKey({}), url.value],
            queryFn: gqlFetcher<ListPublishedSyndicationUrlsQuery, ListPublishedSyndicationUrlsQueryVariables>(
                ListPublishedSyndicationUrlsDocument,
                {},
            )
        })),
        combine: (result) => {
            return combineResult(result, deepMergeConcatArrays);
        },
    });

    React.useEffect(() => {
        setUrls(urls => {
            const nextOnes = queries
                .data
                ?.Syndications
                ?.docs
                .map(({ url, name }) => ({ value: url!, enabled: false, name: name! }))
                .filter(({ value }) => !urls.some((url) => url.value === value)) || [];

            return [
                ...nextOnes,
                ...urls,
            ].sort((a, b) => b.value.localeCompare(a.value));
        });
    }, [queries.data, setUrls]);
};

export const EndpointContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [urls, setUrls] = React.useState<URL[]>([{ enabled: true, value: BACKEND_URL, name: "Main" }]);
    const [authUrl, setAuthUrl] = React.useState<string>(urls[0].value);
    const enabled = React.useMemo(() => urls.filter(({ enabled }) => enabled).map(({ value }) => value), [urls]);

    return (
        <EndpointContext.Provider value={{ setUrls, urls, enabled, authUrl, setAuthUrl }}>
            {props.children}
        </EndpointContext.Provider>
    );
};

export const useEndpointContext = () => React.useContext(EndpointContext);
