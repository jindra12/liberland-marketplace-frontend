import type { QueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../gqlFetcher";

export const invalidatePublishedEntityQueries = async (
    client: QueryClient,
    entityName: string,
    serverUrl: string,
) => {
    const plural = entityName === "Company" ? "Companies" : `${entityName}s`;
    await client.invalidateQueries({
        predicate: (query) => {
            const operation = query.queryKey[0];
            const variables = query.queryKey[1];
            const source = query.queryKey.includes(serverUrl);
            const variablesSource = variables && typeof variables === "object" && "url" in variables
                ? variables.url
                : undefined;
            const matchesSource = source || variablesSource === serverUrl
                || (!variablesSource && query.queryKey.length <= 2 && serverUrl === BACKEND_URL);

            return matchesSource && typeof operation === "string" && (
                operation.startsWith(`List${plural}`)
                || operation.startsWith(`Search${plural}`)
                || operation === `${entityName}ById`
            );
        },
    });
};
