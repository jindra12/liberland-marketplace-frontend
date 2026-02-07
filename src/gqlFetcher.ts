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

export const gqlFetcher = <TData, TVariables>(query: string, variables?: TVariables, options?: RequestInit['headers']) => async (): Promise<TData> => {
    const res = await axios.post<{ data?: TData; errors?: GQLError[] }>(
        "/api/graphql",
        { query, variables },
        { withCredentials: true, headers: normalizeAndReduce(options) },
    );

    if ((res.data?.errors?.length)) {
        throw new Error(res.data.errors[0].message);
    }

    return (res.data.data as TData);
};