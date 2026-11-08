import type { BackendResponseValue } from "./types";

const bindValueSource = (value: BackendResponseValue, serverUrl: string): BackendResponseValue => {
    if (Array.isArray(value)) {
        return value.map((entry) => bindValueSource(entry, serverUrl));
    }
    if (!value || typeof value !== "object") {
        return value;
    }
    const fields = Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [
            key,
            key === "serverURL" || key === "serverUrl" ? serverUrl : bindValueSource(entry, serverUrl),
        ]),
    );
    return typeof value.id === "string" || typeof value.id === "number"
        ? { ...fields, serverURL: serverUrl, serverUrl }
        : fields;
};

/** GraphQL response data is JSON. Source claims come from the request, never the document. */
export const withResponseSource = <TData>(data: TData, serverUrl: string): TData => {
    const value = bindValueSource(data as BackendResponseValue, serverUrl);
    return (
        value && typeof value === "object" && !Array.isArray(value)
            ? { ...value, serverURL: serverUrl, serverUrl }
            : value
    ) as TData;
};
