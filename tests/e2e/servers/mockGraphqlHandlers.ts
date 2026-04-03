import type { GraphqlOperationResult, GraphqlVariables, MockScenarioState } from "./types";
import { handleGraphqlOperation as handleGraphqlOperationFromFolder } from "./mockGraphqlHandlers/index";

export const handleGraphqlOperation = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables = {},
    query = "",
): GraphqlOperationResult => {
    return handleGraphqlOperationFromFolder(state, operationName, variables, query);
};
