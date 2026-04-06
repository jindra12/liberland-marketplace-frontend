import type { GraphQLRequestLog } from "./types";

const logs: GraphQLRequestLog[] = [];

export const recordGraphQLRequestLog = (log: GraphQLRequestLog): void => {
    logs.push(log);
};

export const drainGraphQLRequestLogs = (): GraphQLRequestLog[] => {
    const next = logs.slice();
    logs.length = 0;
    return next;
};
