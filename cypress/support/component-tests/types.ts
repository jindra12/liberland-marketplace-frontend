export type GraphQLVariableValue = string | number | boolean | null | undefined;

export type GraphQLVariables = Record<string, GraphQLVariableValue>;

export type ListGoal = {
    trigger: string;
    route: string;
    title: string;
    operationName: string;
    responseKey: string;
    expectedVariables: GraphQLVariables;
    expectedResultTitle: string;
};

export type DetailGoal = {
    selector: string;
    label: string;
    route: string;
    title: string;
    query?: {
        operationName: string;
        responseKey: string;
        expectedId: string;
        expectedVariables: GraphQLVariables;
    };
};

export type SearchGoal = {
    scopeLabel: string;
    searchTitle: string;
    term: string;
    resultLabel: string;
    route: string;
    title: string;
    searchOperationName: string;
    detailOperationName: string;
    responseKey: string;
    expectedId: string;
    searchExpectedTitle: string;
    detailExpectedVariables: GraphQLVariables;
};

export type GraphQLCollectionDoc = {
    id?: string;
    name?: string;
    title?: string;
};

export type GraphQLCollectionResponse = {
    docs?: GraphQLCollectionDoc[];
    totalDocs?: number;
};

export type GraphQLNodeResponse = {
    id?: string;
    name?: string;
    title?: string;
};

export type GraphQLResponseBody = {
    data?: Record<string, GraphQLCollectionResponse | GraphQLNodeResponse | undefined>;
};
