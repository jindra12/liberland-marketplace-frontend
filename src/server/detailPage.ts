import type { GetServerSideProps } from "next";
import type { DetailPageMetadata } from "../detailMetadata/shared";
import { decodeServerUrlSegment } from "../routes";
import { normalizePublicBackendUrl } from "./security/utils";
import type { DetailPageConfig, DetailRouteParams } from "./types";
import { encodeServerUrlSegment } from "../routes";
import { jsonLdPageResponse } from "./jsonLd/utils";
import { fetchOptionalDetailData } from "./utils";

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

            const extraData = await fetchOptionalDetailData(config.fetchAdditionalData, entity, params, serverUrl);
            return jsonLdPageResponse(
                config.buildMetadata(
                    entity,
                    config.buildCanonicalPath(params, encodeServerUrlSegment(serverUrl)),
                    extraData,
                ),
                context.query,
                context.res,
                context.req.headers.accept,
            );
        } catch (error) {
            console.error(error);
            context.res.statusCode = 503;
            context.res.setHeader("Cache-Control", "no-store");
            context.res.setHeader("Retry-After", "60");
            return jsonLdPageResponse(
                {
                    title: "Marketplace information temporarily unavailable",
                    description: "The source backend is temporarily unavailable. Please retry shortly.",
                    canonicalPath: config.buildCanonicalPath({ id, serverUrl: encodedServerUrl }, encodedServerUrl),
                    jsonLd: [],
                },
                context.query,
                context.res,
                context.req.headers.accept,
            );
        }
    };
};
