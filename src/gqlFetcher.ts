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

export const BACKEND_URL = "https://liberland-marketplace.vercel.app";

export const gqlFetcher = <TData, TVariables>(query: string, variables?: TVariables, options?: RequestInit['headers']) => async (): Promise<TData> => {
    const headers = normalizeAndReduce(options);
    const token = localStorage.getItem("authToken");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await axios.post<{ data?: TData; errors?: GQLError[] }>(
        `${BACKEND_URL}/api/graphql`,
        { query, variables },
        { headers },
    );

    if ((res.data?.errors?.length)) {
        throw new Error(res.data.errors[0].message);
    }

    return (res.data.data as TData);
};