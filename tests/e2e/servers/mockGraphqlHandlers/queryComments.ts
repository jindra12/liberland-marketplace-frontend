import type { GraphqlOperationResult, GraphqlVariables, MockScenarioState } from "../types";
import { toArray, toPage } from "./shared";
import { toComment } from "./entities";

export const handleCommentQueries = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables,
): GraphqlOperationResult | null => {
    if (operationName === "ListCommentsByTarget") {
        const docs = toArray(state.comments)
            .filter((comment) => {
                return (
                    comment.replyPostRelationTo === variables.relationTo &&
                    comment.replyPostValue === variables.targetId &&
                    !comment.replyComment
                );
            })
            .map((comment) => toComment(state, comment));
        return {
            data: {
                Comments: toPage(docs, variables, true),
            },
        };
    }

    if (operationName === "ListRepliesToComment") {
        const docs = toArray(state.comments)
            .filter((comment) => comment.replyComment === variables.parentCommentId)
            .map((comment) => toComment(state, comment));
        return {
            data: {
                Comments: {
                    docs,
                    totalDocs: docs.length,
                },
            },
        };
    }

    return null;
};
