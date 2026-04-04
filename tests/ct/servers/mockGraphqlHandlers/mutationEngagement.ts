import type { GraphqlOperationResult, GraphqlVariables, JsonValue, MockNotificationSubscription, MockScenarioState, MockComment, MockStartup } from "../types";
import { allocateId, ensureEntityExists, findRecord, getActiveUser, normalizeRelationIds, toArray } from "./shared";

type EngagementMutationVariables = GraphqlVariables & {
    content?: string | null;
    id?: JsonValue;
    input?: {
        distinctId?: string | null;
    };
    parentCommentId?: string | null;
    replyToPost?: {
        relationTo?: string | null;
        value?: string | null;
    } | null;
    subscriptionID?: JsonValue;
    targetID?: string | null;
    email?: string | null;
};

const handleCreateNotificationSubscription = (state: MockScenarioState, targetCollection: string, variables: GraphqlVariables) => {
    const request = variables as EngagementMutationVariables;
    const subscription: MockNotificationSubscription = {
        id: allocateId(state, "notificationSubscription", "notification-subscription"),
        email: request.email ?? null,
        targetCollection,
        targetID: request.targetID ?? null,
    };

    state.notificationSubscriptions = [...toArray(state.notificationSubscriptions), subscription];

    return {
        data: {
            createNotificationSubscription: subscription,
        },
    };
};

const handleDeleteNotificationSubscription = (state: MockScenarioState, variables: GraphqlVariables) => {
    const request = variables as EngagementMutationVariables;
    const existingSubscription = findRecord<MockNotificationSubscription>(state, "notificationSubscriptions", String(request.subscriptionID));
    const notFound = ensureEntityExists(existingSubscription, "deleteNotificationSubscription");

    if (notFound) {
        return notFound;
    }
    if (!existingSubscription) {
        return notFound;
    }

    state.notificationSubscriptions = toArray(state.notificationSubscriptions).filter((subscription) => {
        return subscription.id !== String(request.subscriptionID);
    });

    return {
        data: {
            deleteNotificationSubscription: {
                id: request.subscriptionID,
            },
        },
    };
};

const handleCreateComment = (state: MockScenarioState, variables: GraphqlVariables, includeReplyComment: boolean) => {
    const request = variables as EngagementMutationVariables;
    const activeUser = getActiveUser(state);
    const replyToPost = request.replyToPost ?? {};
    const comment: MockComment = {
        id: allocateId(state, "comment", "comment"),
        content: request.content ?? "",
        createdBy: activeUser?.id ?? null,
        anonymousHash: `mock-comment-${Date.now()}`,
        replyPostRelationTo: replyToPost.relationTo ?? null,
        replyPostValue: replyToPost.value ?? null,
        replyComment: includeReplyComment ? request.parentCommentId ?? null : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    state.comments = [...toArray(state.comments), comment];

    return {
        data: {
            createComment: {
                ...comment,
                replyComment: includeReplyComment && comment.replyComment ? { id: comment.replyComment } : null,
            },
        },
    };
};

const handleUpdateComment = (state: MockScenarioState, variables: GraphqlVariables) => {
    const request = variables as EngagementMutationVariables;
    const existingComment = findRecord<MockComment>(state, "comments", String(request.id));
    const notFound = ensureEntityExists(existingComment, "updateComment");

    if (notFound) {
        return notFound;
    }
    if (!existingComment) {
        return notFound;
    }

    const nextComment: MockComment = {
        ...existingComment,
        content: request.content ?? existingComment.content ?? "",
        updatedAt: new Date().toISOString(),
    };
    state.comments = toArray(state.comments).map((comment) => {
        return comment.id === String(request.id) ? nextComment : comment;
    });

    return {
        data: {
            updateComment: {
                id: nextComment.id,
                content: nextComment.content,
                updatedAt: nextComment.updatedAt,
            },
        },
    };
};

const handleDeleteComment = (state: MockScenarioState, variables: GraphqlVariables) => {
    const request = variables as EngagementMutationVariables;
    const existingComment = findRecord<MockComment>(state, "comments", String(request.id));
    const notFound = ensureEntityExists(existingComment, "deleteComment");

    if (notFound) {
        return notFound;
    }
    if (!existingComment) {
        return notFound;
    }

    state.comments = toArray(state.comments).filter((comment) => {
        return comment.id !== String(request.id) && comment.replyComment !== String(request.id);
    });

    return {
        data: {
            deleteComment: {
                id: request.id,
            },
        },
    };
};

const handleJoinStartup = (state: MockScenarioState, variables: GraphqlVariables, shouldJoin: boolean) => {
    const request = variables as EngagementMutationVariables;
    const startup = findRecord<MockStartup>(state, "startups", String(request.id));
    const activeUser = getActiveUser(state);
    const notFound = ensureEntityExists(startup, shouldJoin ? "joinStartup" : "leaveStartup");

    if (notFound) {
        return notFound;
    }
    if (!startup) {
        return notFound;
    }

    const userId = activeUser?.id ?? null;
    const involvedUsers = shouldJoin
        ? Array.from(new Set([...normalizeRelationIds(startup.involvedUsers), ...(userId ? [userId] : [])]))
        : normalizeRelationIds(startup.involvedUsers).filter((entry) => entry !== userId);
    const nextStartup = {
        ...startup,
        involvedUsers,
        updatedAt: new Date().toISOString(),
    };

    state.startups = toArray(state.startups).map((entry) => {
        return entry.id === startup.id ? nextStartup : entry;
    });

    return {
        data: {
            [shouldJoin ? "joinStartup" : "leaveStartup"]: {
                message: shouldJoin ? "Joined startup" : "Left startup",
                startup: {
                    id: nextStartup.id,
                    title: nextStartup.title,
                    involvedUsers: involvedUsers.map((id) => ({ id })),
                },
            },
        },
    };
};

const handleTrackAnalyticsEvent = (state: MockScenarioState, variables: GraphqlVariables) => {
    const request = variables as EngagementMutationVariables;
    const distinctId = request.input?.distinctId ?? getActiveUser(state)?.id ?? "mock-user";
    const sequence = allocateId(state, "analytics", "analytics");

    return {
        data: {
            trackAnalyticsEvent: {
                success: true,
                analytics: {
                    distinctId,
                    eventId: `${sequence}-event`,
                    sessionId: `${sequence}-session`,
                },
            },
        },
    };
};

export const handleEngagementMutations = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables,
): GraphqlOperationResult | null => {
    if (operationName === "CreateComment") {
        return handleCreateComment(state, variables, false);
    }

    if (operationName === "CreateReplyToComment") {
        return handleCreateComment(state, variables, true);
    }

    if (operationName === "UpdateCommentContent") {
        return handleUpdateComment(state, variables);
    }

    if (operationName === "DeleteComment") {
        return handleDeleteComment(state, variables);
    }

    if (operationName === "SubscribeToCompanyUpdates") {
        return handleCreateNotificationSubscription(state, "companies", variables);
    }

    if (operationName === "SubscribeToJobUpdates") {
        return handleCreateNotificationSubscription(state, "jobs", variables);
    }

    if (operationName === "SubscribeToProductUpdates") {
        return handleCreateNotificationSubscription(state, "products", variables);
    }

    if (operationName === "SubscribeToTribeUpdates") {
        return handleCreateNotificationSubscription(state, "identities", variables);
    }

    if (operationName === "SubscribeToVentureUpdates") {
        return handleCreateNotificationSubscription(state, "startups", variables);
    }

    if (
        operationName === "UnsubscribeFromCompanyUpdates" ||
        operationName === "UnsubscribeFromJobUpdates" ||
        operationName === "UnsubscribeFromProductUpdates" ||
        operationName === "UnsubscribeFromTribeUpdates" ||
        operationName === "UnsubscribeFromVentureUpdates"
    ) {
        return handleDeleteNotificationSubscription(state, variables);
    }

    if (operationName === "JoinStartup") {
        return handleJoinStartup(state, variables, true);
    }

    if (operationName === "LeaveStartup") {
        return handleJoinStartup(state, variables, false);
    }

    if (operationName === "TrackAnalyticsEvent") {
        return handleTrackAnalyticsEvent(state, variables);
    }

    return null;
};
