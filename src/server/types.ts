import type { DetailPageMetadata } from "../detailMetadata/shared";

export type GraphQLServerResponse<TData> = {
    data?: TData;
    errors?: Array<{ message: string }>;
};

export type ClientAddressRequest = {
    headers: Record<string, string | string[] | undefined>;
    socket: { remoteAddress?: string };
};

export type DetailRouteParams = {
    id?: string;
    serverUrl?: string;
};

export type DetailPageConfig<TData, TVariables extends object | undefined, TEntity, TExtra = undefined> = {
    fetcher: (variables: TVariables, url?: string, headers?: HeadersInit) => Promise<TData>;
    buildVariables: (params: DetailRouteParams) => TVariables | null | undefined;
    selectEntity: (data: TData, params: DetailRouteParams) => TEntity | null | undefined;
    fetchAdditionalData?: (entity: TEntity, params: DetailRouteParams, serverUrl: string) => Promise<TExtra> | TExtra;
    buildMetadata: (entity: TEntity, canonicalPath: string, extraData?: TExtra) => DetailPageMetadata;
    buildCanonicalPath: (params: DetailRouteParams, encodedServerUrl: string) => string;
};

export type CollectionRoute = "/companies" | "/tribes" | "/jobs" | "/products-services" | "/ventures" | "/posts";

export type CollectionPageProps = {
    jsonLdAlternateUrl?: string;
    title: string;
    description: string;
    canonicalPath: string;
    jsonLd: Record<string, unknown>[];
    extraMetaTags: Array<{ name?: string; property?: string; content: string }>;
    extraLinks: Array<{ href: string; rel: string }>;
};
