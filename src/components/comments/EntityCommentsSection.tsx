import * as React from "react";
import { Alert, Flex, Spin, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import { CommentSection } from "react-comments-section";
import "react-comments-section/dist/index.css";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
    Comment_ReplyPost_Relation_RelationTo,
    ListCommentsByTargetQuery,
    useCreateCommentMutation,
    useCreateReplyToCommentMutation,
    useDeleteCommentMutation,
    useListCommentsByTargetQuery,
    useUpdateCommentContentMutation,
} from "../../generated/graphql";

type CommentDoc = NonNullable<NonNullable<ListCommentsByTargetQuery["Comments"]>["docs"]>[number];
type CommentDataItem = React.ComponentProps<typeof CommentSection>["commentData"][number];
type CurrentUser = NonNullable<React.ComponentProps<typeof CommentSection>["currentUser"]>;
type OidcProfile = {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
    profile?: string;
};
type SubmitPayload = { text: string };
type ReplyPayload = { text: string; repliedToCommentId: string };
type EditPayload = { text: string; comId: string };
type DeletePayload = { comIdToDelete: string };
type CommentGrouping = {
    roots: CommentDoc[];
    repliesByParent: Map<string, CommentDataItem[]>;
};

type EntityCommentsSectionProps = {
    targetId: string;
    relationTo: Comment_ReplyPostRelationshipInputRelationTo;
    title?: string;
    limit?: number;
    placeholder?: string;
    className?: string;
};

const RELATION_TO_QUERY_RELATION: Record<
    Comment_ReplyPostRelationshipInputRelationTo,
    Comment_ReplyPost_Relation_RelationTo
> = {
    [Comment_ReplyPostRelationshipInputRelationTo.Companies]: Comment_ReplyPost_Relation_RelationTo.Companies,
    [Comment_ReplyPostRelationshipInputRelationTo.Identities]: Comment_ReplyPost_Relation_RelationTo.Identities,
    [Comment_ReplyPostRelationshipInputRelationTo.Jobs]: Comment_ReplyPost_Relation_RelationTo.Jobs,
    [Comment_ReplyPostRelationshipInputRelationTo.Products]: Comment_ReplyPost_Relation_RelationTo.Products,
};

const commentTimestamp = (comment: CommentDoc) => (
    comment.updatedAt ?? comment.createdAt ?? undefined
) as string | undefined;

const toCommentItem = (comment: CommentDoc): CommentDataItem => {
    if (comment.createdBy) {
        const fullName = comment.createdBy.name || comment.createdBy.email || "User";
        return {
            userId: `user:${comment.createdBy.email || comment.createdBy.id}`,
            comId: comment.id,
            fullName,
            avatarUrl: "/logo192.png",
            userProfile: "",
            text: comment.content,
            timestamp: commentTimestamp(comment),
        };
    }

    return {
        userId: `anon:${comment.anonymousHash || comment.id}`,
        comId: comment.id,
        fullName: "Anonymous",
        avatarUrl: "/logo192.png",
        userProfile: "",
        text: comment.content,
        timestamp: commentTimestamp(comment),
    };
};

export const EntityCommentsSection: React.FunctionComponent<EntityCommentsSectionProps> = ({
    targetId,
    relationTo,
    title = "Comments",
    limit = 100,
    placeholder = "Write your comment...",
    className,
}) => {
    const auth = useAuth();
    const queryRelationTo = RELATION_TO_QUERY_RELATION[relationTo];
    const comments = useListCommentsByTargetQuery(
        { targetId, relationTo: queryRelationTo, limit },
        { enabled: Boolean(targetId) }
    );
    const createComment = useCreateCommentMutation();
    const createReply = useCreateReplyToCommentMutation();
    const updateComment = useUpdateCommentContentMutation();
    const deleteComment = useDeleteCommentMutation();

    const currentUser = React.useMemo<CurrentUser>(() => {
        const profile = auth.user?.profile as OidcProfile | undefined;
        const email = profile?.email;
        const name = profile?.name;
        const picture = profile?.picture;
        const sub = profile?.sub;
        const profileLink = profile?.profile || "";

        if (auth.isAuthenticated) {
            return {
                currentUserId: email || sub || "authorized-user",
                currentUserImg: picture || "/logo192.png",
                currentUserProfile: profileLink,
                currentUserFullName: name || email || "Authorized user",
            };
        }

        // Keep comment input enabled for guests while hiding edit/delete controls via CSS.
        return {
            currentUserId: "__anonymous_writer__",
            currentUserImg: "/logo192.png",
            currentUserProfile: "",
            currentUserFullName: "Anonymous",
        };
    }, [auth.isAuthenticated, auth.user]);

    const commentData = React.useMemo<CommentDataItem[]>(() => {
        const docs = comments.data?.Comments?.docs || [];
        const { roots, repliesByParent } = docs.reduce<CommentGrouping>((acc, comment) => {
            const parentId = comment.replyComment?.id;
            if (!parentId) {
                acc.roots.push(comment);
                return acc;
            }

            const existingReplies = acc.repliesByParent.get(parentId) || [];
            existingReplies.push(toCommentItem(comment));
            acc.repliesByParent.set(parentId, existingReplies);
            return acc;
        }, {
            roots: [],
            repliesByParent: new Map<string, CommentDataItem[]>(),
        });

        return roots.map((comment) => {
            const root = toCommentItem(comment);
            const replies = repliesByParent.get(comment.id);
            if (!replies?.length) {
                return root;
            }

            return {
                ...root,
                replies,
            };
        });
    }, [comments.data]);

    const refetchComments = React.useCallback(async () => {
        await comments.refetch();
    }, [comments]);

    const onSubmitAction = React.useCallback(async (payload: SubmitPayload) => {
        const content = payload.text.trim();
        if (!content) {
            return;
        }

        await createComment.mutateAsync({
            replyToPost: {
                relationTo,
                value: targetId,
            },
            content,
        });
        await refetchComments();
    }, [createComment, refetchComments, relationTo, targetId]);

    const onReplyAction = React.useCallback(async (payload: ReplyPayload) => {
        const content = payload.text.trim();
        const parentCommentId = payload.repliedToCommentId;
        if (!content || !parentCommentId) {
            return;
        }

        await createReply.mutateAsync({
            replyToPost: {
                relationTo,
                value: targetId,
            },
            parentCommentId,
            content,
        });
        await refetchComments();
    }, [createReply, refetchComments, relationTo, targetId]);

    const onEditAction = React.useCallback(async (payload: EditPayload) => {
        if (!auth.isAuthenticated) {
            return;
        }

        const content = payload.text.trim();
        const commentId = payload.comId;
        if (!content || !commentId) {
            return;
        }

        await updateComment.mutateAsync({
            id: commentId,
            content,
        });
        await refetchComments();
    }, [auth.isAuthenticated, refetchComments, updateComment]);

    const onDeleteAction = React.useCallback(async (payload: DeletePayload) => {
        const commentId = payload.comIdToDelete;
        if (!auth.isAuthenticated || !commentId) {
            return;
        }

        await deleteComment.mutateAsync({
            id: commentId,
        });
        await refetchComments();
    }, [auth.isAuthenticated, deleteComment, refetchComments]);

    if (comments.isLoading) {
        return (
            <Flex justify="center" align="center" className="EntityCommentsSection">
                <Spin />
            </Flex>
        );
    }

    if (comments.error) {
        return (
            <Alert
                type="error"
                showIcon
                message="Failed to load comments"
                description="Try refreshing the page."
                className="EntityCommentsSection"
            />
        );
    }

    return (
        <div className={["EntityCommentsSection", !auth.isAuthenticated && "EntityCommentsSection--anonymous", className].filter(Boolean).join(" ")}>
            <Typography.Title level={4} className="EntityCommentsSection__title">
                {title}
            </Typography.Title>
            <CommentSection
                key={`${targetId}-${auth.isAuthenticated ? "auth" : "anonymous"}`}
                currentUser={currentUser}
                logIn={{
                    onLogin: () => auth.signinRedirect(),
                    onSignUp: () => auth.signinRedirect(),
                }}
                commentData={commentData}
                placeHolder={placeholder}
                showTimestamp
                onSubmitAction={onSubmitAction}
                onReplyAction={onReplyAction}
                onEditAction={onEditAction}
                onDeleteAction={onDeleteAction}
            />
        </div>
    );
};
