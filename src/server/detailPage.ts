import type { GetServerSideProps } from "next";
import { decodeServerUrlSegment, type DetailPageMetadata } from "../detailMetadata/shared";
import { normalizePublicBackendUrl } from "./security/utils";
import type { DetailPageConfig, DetailRouteParams } from "./types";
import { encodeServerUrlSegment } from "../routes";
import { jsonLdPageResponse } from "./jsonLd/utils";

export const createDetailPageProps = <TData, TVariables extends object | undefined, TEntity, TExtra = undefined>(
    config: DetailPageConfig<TData, TVariables, TEntity, TExtra>,
): GetServerSideProps<DetailPageMetadata, DetailRouteParams> => {
    return async (context) => {
        const id = context.params?.id;
        const encodedServerUrl = context.params?.serverUrl;
        if (typeof id !== "string" || typeof encodedServerUrl !== "string") {
            return { notFound: true };
        }

        const decodedServerUrl = decodeServerUrlSegment(encodedServerUrl);
        if (!decodedServerUrl) {
            return { notFound: true };
        }

        try {
            const serverUrl = normalizePublicBackendUrl(decodedServerUrl);
            const params = { id, serverUrl: encodedServerUrl };
            const variables = config.buildVariables(params);
            if (!variables) {
                return { notFound: true };
            }

            const data = await config.fetcher(variables, serverUrl);
            const entity = config.selectEntity(data, params);
            if (!entity) {
                return { notFound: true };
            }

            const extraData = config.fetchAdditionalData
                ? await config.fetchAdditionalData(entity, params, serverUrl)
                : undefined;
            return jsonLdPageResponse(
                config.buildMetadata(entity, config.buildCanonicalPath(params, encodeServerUrlSegment(serverUrl)), extraData),
                context.query,
                context.res,
            );
        } catch (error) {
            console.error(error);
            return { notFound: true };
        }
    };
};
