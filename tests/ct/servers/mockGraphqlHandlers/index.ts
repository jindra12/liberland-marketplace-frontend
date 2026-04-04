import type { GraphqlOperationResult, GraphqlVariables, MockScenarioState } from "../types";
import { handleBasicQueries } from "./queryBasics";
import { handleCollectionQueries } from "./queryCollections";
import { handleCommentQueries } from "./queryComments";
import { handleSearchQueries } from "./querySearch";
import { handleCommerceMutations } from "./mutationCommerce";
import { handleCollectionMutations } from "./mutationCollections";
import { handleEngagementMutations } from "./mutationEngagement";

const handleQuery = (state: MockScenarioState, operationName: string, variables: GraphqlVariables): GraphqlOperationResult => {
    return (
        handleBasicQueries(state, operationName, variables) ??
        handleCollectionQueries(state, operationName, variables) ??
        handleSearchQueries(state, operationName, variables) ??
        handleCommentQueries(state, operationName, variables) ?? {
            errors: [{ message: `No mock handler defined for query operation ${operationName}` }],
        }
    );
};

const handleMutation = (state: MockScenarioState, operationName: string, variables: GraphqlVariables): GraphqlOperationResult => {
    return (
        handleCommerceMutations(state, operationName, variables) ??
        handleCollectionMutations(state, operationName, variables) ??
        handleEngagementMutations(state, operationName, variables) ?? {
            errors: [{ message: `No mock handler defined for mutation operation ${operationName}` }],
        }
    );
};

export const handleGraphqlOperation = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables = {},
    query = "",
): GraphqlOperationResult => {
    const trimmedQuery = String(query).trim();
    const isMutation = trimmedQuery.startsWith("mutation");
    return isMutation ? handleMutation(state, operationName, variables) : handleQuery(state, operationName, variables);
};
