import * as React from "react";

import type { GetServerSideProps } from "next";

import { AppHead } from "./AppHead";
import { Dynamic } from "./Dynamic";
import { decodeServerUrlSegment, type DetailPageMetadata } from "./detailMetadata/shared";

export type DetailRouteParams = {
    id?: string;
    serverUrl?: string;
};

type DetailFetcher<TData, TVariables extends object | undefined> = (
    variables: TVariables,
    url?: string,
    options?: RequestInit["headers"],
) => Promise<TData>;

type CreateDetailPageConfig<TData, TVariables extends object | undefined, TEntity, TExtra = undefined> = {
    fetcher: DetailFetcher<TData, TVariables>;
    buildVariables: (params: DetailRouteParams) => TVariables | null | undefined;
    selectEntity: (data: TData, params: DetailRouteParams) => TEntity | null | undefined;
    fetchAdditionalData?: (
        entity: TEntity,
        params: DetailRouteParams,
        serverUrl: string,
    ) => Promise<TExtra> | TExtra;
    buildMetadata: (entity: TEntity, canonicalPath: string, extraData?: TExtra) => DetailPageMetadata;
    buildCanonicalPath: (params: DetailRouteParams, encodedServerUrl: string) => string;
};

const isValidServerUrl = (value: string): boolean => {
    return value.startsWith("http://") || value.startsWith("https://");
};

export const createDetailPage = <TData, TVariables extends object | undefined, TEntity, TExtra = undefined>(
    config: CreateDetailPageConfig<TData, TVariables, TEntity, TExtra>,
) => {
    const getServerSideProps: GetServerSideProps<DetailPageMetadata, DetailRouteParams> = async (context) => {
        const id = context.params?.id;
        const encodedServerUrl = context.params?.serverUrl;

        if (typeof id !== "string" || typeof encodedServerUrl !== "string") {
            return {
                notFound: true,
            };
        }

        const serverUrl = decodeServerUrlSegment(encodedServerUrl);

        if (!serverUrl || !isValidServerUrl(serverUrl)) {
            return {
                notFound: true,
            };
        }

        const variables = config.buildVariables({
            id,
            serverUrl: encodedServerUrl,
        });

        if (variables === null || variables === undefined) {
            return {
                notFound: true,
            };
        }

        try {
            const data = await config.fetcher(variables, serverUrl);
            const entity = config.selectEntity(data, {
                id,
                serverUrl: encodedServerUrl,
            });

            if (!entity) {
                return {
                    notFound: true,
                };
            }

            const extraData = config.fetchAdditionalData
                ? await config.fetchAdditionalData(entity, { id, serverUrl: encodedServerUrl }, serverUrl)
                : undefined;

            return {
                props: config.buildMetadata(entity, config.buildCanonicalPath({ id, serverUrl: encodedServerUrl }, encodedServerUrl), extraData),
            };
        } catch (error) {
            console.error(error);
            return {
                notFound: true,
            };
        }
    };

    const DetailPage: React.FunctionComponent<DetailPageMetadata> = (props) => {
        return (
            <>
                <AppHead
                    title={props.title}
                    description={props.description}
                    canonicalPath={props.canonicalPath}
                    jsonLd={props.jsonLd}
                    imageUrl={props.imageUrl}
                    imageAlt={props.imageAlt}
                    ogType={props.ogType}
                    extraMetaTags={props.extraMetaTags}
                />
                <Dynamic />
            </>
        );
    };

    return {
        getServerSideProps,
        DetailPage,
    };
};
