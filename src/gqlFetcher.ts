import axios, { AxiosHeaders } from "axios";

type GQLError = { message: string };

const reduceOptions = (options: [string, string][]) => {
    return options.reduce((headers: AxiosHeaders, [key, value]) => {
        headers.set(key, value);
        return headers;
    }, new AxiosHeaders());
};

const normalizeAndReduce = (options?: RequestInit['headers']) => {
    if (Array.isArray(options)) {
        return reduceOptions(options);
    }
    return reduceOptions(Object.entries(options || {}));
}

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://backend.nswap.io";

export const getAccessToken = (): string | undefined => {
    const key = `oidc.user:${BACKEND_URL}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored).access_token : undefined;
};

export const gqlFetcher = <TData, TVariables>(query: string, variables?: TVariables, options?: RequestInit['headers'], url?: string) => async (): Promise<TData> => {
    const headers = normalizeAndReduce(options);
    const token = getAccessToken();
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await axios.post<{ data?: TData; errors?: GQLError[] }>(
        `${url || BACKEND_URL}/api/graphql`,
        { query, variables },
        { headers },
    );

    if ((res.data?.errors?.length)) {
        throw new Error(res.data.errors[0].message);
    }

    return (res.data.data as TData);
};