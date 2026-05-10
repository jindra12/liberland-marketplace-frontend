import axios, { AxiosHeaders } from "axios";
import { appAnalytics } from "./components/analytics/analytics";

type GQLError = { message: string };

const reduceOptions = (options: [string, string][]) => {
    return options.reduce((headers: AxiosHeaders, [key, value]) => {
        headers.set(key, value);
        return headers;
    }, new AxiosHeaders());
};

const normalizeAndReduce = (options?: RequestInit["headers"]) => {
    if (Array.isArray(options)) {
        return reduceOptions(options);
    }
    return reduceOptions(Object.entries(options || {}));
};

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://backend.nswap.io";

const getCurrentRoute = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

const getGraphQLOperation = (query: string) => {
    const match = query.match(/\b(query|mutation|subscription)\s+([A-Za-z0-9_]+)/);

    if (!match) {
        return {
            operationName: "anonymous",
            operationType: "unknown",
        };
    }

    return {
        operationName: match[2],
        operationType: match[1],
    };
};

export const getAccessToken = (url: string): string | undefined => {
    const key = `oidc.user:${url}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored).access_token : undefined;
};

export const gqlFetcher =
    <TData, TVariables extends object | undefined>(
        query: string,
        variables?: TVariables,
        options?: RequestInit["headers"],
        url?: string | null,
        anonymizer?: (variables: TVariables) => TVariables,
    ) =>
    async (): Promise<TData> => {
        const defUrl = url || BACKEND_URL;
        const startedAt = Date.now();
        const { operationName, operationType } = getGraphQLOperation(query);
        const headers = normalizeAndReduce(options);
        const token = getAccessToken(defUrl);

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        try {
            const res = await axios.post<{ data?: TData; errors?: GQLError[] }>(
                `${defUrl}/api/graphql`,
                { query, variables },
                { headers },
            );

            if (res.data?.errors?.length) {
                throw new Error(res.data.errors[0].message);
            }

            if (operationName !== "TrackAnalyticsEvent") {
                appAnalytics.track(
                    `graphql.${operationType}`,
                    {
                        durationMs: Date.now() - startedAt,
                        operationName,
                        operationType,
                        route: getCurrentRoute(),
                        success: true,
                        variables: anonymizer?.(variables!) || variables,
                    },
                    {
                        targetUrl: defUrl,
                    },
                );
            }

            return res.data.data as TData;
        } catch (error) {
            if (operationName !== "TrackAnalyticsEvent") {
                appAnalytics.track(
                    `graphql.${operationType}`,
                    {
                        durationMs: Date.now() - startedAt,
                        errorMessage: error instanceof Error ? error.message : "Unknown error",
                        operationName,
                        operationType,
                        route: getCurrentRoute(),
                        success: false,
                        variables: anonymizer?.(variables!) || variables,
                    },
                    {
                        targetUrl: defUrl,
                    },
                );
            }

            throw error;
        }
    };
