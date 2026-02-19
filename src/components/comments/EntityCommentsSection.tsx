import * as React from "react";
import { Alert, Flex, Spin, Typography, theme } from "antd";
import { useAuth } from "react-oidc-context";
import { CommentSection } from "react-comments-section";
import "react-comments-section/dist/index.css";
import {
    useCreateCommentMutation,
    useCreateReplyToCommentMutation,
    useDeleteCommentMutation,
    useListCommentsByTargetQuery,
    useUpdateCommentContentMutation,
} from "../../generated/graphql";
import {
    COMMENT_RELATION_TO_QUERY_RELATION,
    ENTITY_COMMENTS_DEFAULT_LIMIT,
    ENTITY_COMMENTS_DEFAULT_PLACEHOLDER,
    ENTITY_COMMENTS_DEFAULT_TITLE,
} from "../../constants";
import {
    AuthProfile,
    CommentDeletePayload,
    CommentEditPayload,
    CommentReplyPayload,
    CommentSubmitPayload,
    EntityCommentsSectionProps,
} from "../../types";
import {
    buildCommentData,
    getCommentCurrentUser,
    getCommentSectionStyles,
    getCommentThemeVars,
} from "../../utils";

export const EntityCommentsSection: React.FunctionComponent<EntityCommentsSectionProps> = ({
    targetId,
    relationTo,
    title = ENTITY_COMMENTS_DEFAULT_TITLE,
    limit = ENTITY_COMMENTS_DEFAULT_LIMIT,
    placeholder = ENTITY_COMMENTS_DEFAULT_PLACEHOLDER,
    className,
}) => {
    const auth = useAuth();
    const { token } = theme.useToken();
    const queryRelationTo = COMMENT_RELATION_TO_QUERY_RELATION[relationTo];
    const comments = useListCommentsByTargetQuery(
        { targetId, relationTo: queryRelationTo, limit },
        { enabled: Boolean(targetId) }
    );
    const createComment = useCreateCommentMutation();
    const createReply = useCreateReplyToCommentMutation();
    const updateComment = useUpdateCommentContentMutation();
    const deleteComment = useDeleteCommentMutation();

    const profile = auth.user?.profile as AuthProfile | undefined;
    const currentUser = React.useMemo(
        () => getCommentCurrentUser(auth.isAuthenticated, profile),
        [auth.isAuthenticated, profile]
    );

    const commentData = React.useMemo(() => {
        const docs = comments.data?.Comments?.docs || [];
        return buildCommentData(docs);
    }, [comments.data]);

    const refetchComments = React.useCallback(async () => {
        await comments.refetch();
    }, [comments]);

    const commentThemeVars = React.useMemo(() => getCommentThemeVars(token), [token]);
    const commentSectionStyles = React.useMemo(() => getCommentSectionStyles(token), [token]);

    const onSubmitAction = React.useCallback(async (payload: CommentSubmitPayload) => {
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

    const onReplyAction = React.useCallback(async (payload: CommentReplyPayload) => {
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

    const onEditAction = React.useCallback(async (payload: CommentEditPayload) => {
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

    const onDeleteAction = React.useCallback(async (payload: CommentDeletePayload) => {
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
        <div
            className={["EntityCommentsSection", !auth.isAuthenticated && "EntityCommentsSection--anonymous", className].filter(Boolean).join(" ")}
            style={commentThemeVars}
        >
            <Typography.Title level={4} className="EntityCommentsSection__title">
                {title}
            </Typography.Title>
            <CommentSection
                key={`${relationTo}-${targetId}-${auth.isAuthenticated ? "auth" : "anonymous"}`}
                currentUser={currentUser}
                logIn={{
                    onLogin: () => auth.signinRedirect(),
                    onSignUp: () => auth.signinRedirect(),
                }}
                commentData={commentData}
                placeHolder={placeholder}
                showTimestamp
                overlayStyle={commentSectionStyles.overlayStyle}
                formStyle={commentSectionStyles.formStyle}
                inputStyle={commentSectionStyles.inputStyle}
                replyInputStyle={commentSectionStyles.replyInputStyle}
                submitBtnStyle={commentSectionStyles.submitBtnStyle}
                cancelBtnStyle={commentSectionStyles.cancelBtnStyle}
                hrStyle={commentSectionStyles.hrStyle}
                titleStyle={commentSectionStyles.titleStyle}
                onSubmitAction={onSubmitAction}
                onReplyAction={onReplyAction}
                onEditAction={onEditAction}
                onDeleteAction={onDeleteAction}
            />
        </div>
    );
};
