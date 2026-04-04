import * as React from "react";

import { CommentSection } from "react-comments-section";
import { useAuth } from "react-oidc-context";

import { Alert, Flex, Spin, theme } from "antd";

import "react-comments-section/dist/index.css";
import {
    COMMENT_RELATION_TO_QUERY_RELATION,
    ENTITY_COMMENTS_DEFAULT_LIMIT,
    ENTITY_COMMENTS_DEFAULT_PLACEHOLDER,
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
    useCreateCommentMutation,
    useCreateReplyToCommentMutation,
    useDeleteCommentMutation,
    useListCommentsByTargetQuery,
    useUpdateCommentContentMutation,
} from "../hooks";

import { buildCommentData, getCommentCurrentUser, getCommentSectionStyles, getCommentThemeVars } from "./utils";

export const EntityCommentsSection: React.FunctionComponent<EntityCommentsSectionProps> = (props) => {
    const limit = props.limit === undefined ? ENTITY_COMMENTS_DEFAULT_LIMIT : props.limit;
    const placeholder = props.placeholder === undefined ? ENTITY_COMMENTS_DEFAULT_PLACEHOLDER : props.placeholder;
    const auth = useAuth();
    const { token } = theme.useToken();
    const queryRelationTo = COMMENT_RELATION_TO_QUERY_RELATION[props.relationTo];
    const comments = useListCommentsByTargetQuery({
        targetId: props.targetId,
        relationTo: queryRelationTo,
        limit,
        url: props.serverURL,
    });
    const createComment = useCreateCommentMutation();
    const createReply = useCreateReplyToCommentMutation();
    const updateComment = useUpdateCommentContentMutation();
    const deleteComment = useDeleteCommentMutation();
    const profile = auth.user?.profile as AuthProfile | undefined;
    const currentUser = React.useMemo(
        () => getCommentCurrentUser(auth.isAuthenticated, profile),
        [auth.isAuthenticated, profile],
    );
    const commentData = React.useMemo(() => {
        const docs = comments.data?.Comments?.docs || [];
        return buildCommentData(docs);
    }, [comments.data]);
    const commentThemeVars = React.useMemo(() => getCommentThemeVars(token), [token]);
    const commentSectionStyles = React.useMemo(() => getCommentSectionStyles(token), [token]);
    const onSubmitAction = async (payload: CommentSubmitPayload) => {
        const content = payload.text.trim();
        if (!content) {
            return;
        }
        await createComment.mutateAsync({
            url: props.serverURL,
            replyToPost: {
                relationTo: props.relationTo,
                value: props.targetId,
            },
            content,
        });
    };
    const onReplyAction = async (payload: CommentReplyPayload) => {
        const content = payload.text.trim();
        const parentCommentId = payload.repliedToCommentId;
        if (!content || !parentCommentId) {
            return;
        }
        await createReply.mutateAsync({
            url: props.serverURL,
            replyToPost: {
                relationTo: props.relationTo,
                value: props.targetId,
            },
            parentCommentId,
            content,
        });
    };
    const onEditAction = async (payload: CommentEditPayload) => {
        if (!auth.isAuthenticated) {
            return;
        }
        const content = payload.text.trim();
        const commentId = payload.comId;
        if (!content || !commentId) {
            return;
        }
        await updateComment.mutateAsync({
            url: props.serverURL,
            id: commentId,
            content,
        });
    };
    const onDeleteAction = async (payload: CommentDeletePayload) => {
        const commentId = payload.comIdToDelete;
        if (!auth.isAuthenticated || !commentId) {
            return;
        }
        await deleteComment.mutateAsync({
            url: props.serverURL,
            id: commentId,
        });
    };
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
            className={[
                "EntityCommentsSection",
                !auth.isAuthenticated && "EntityCommentsSection--anonymous",
                props.className,
            ]
                .filter(Boolean)
                .join(" ")}
            style={commentThemeVars}
        >
            <CommentSection
                key={`${props.relationTo}-${props.targetId}-${auth.isAuthenticated ? "auth" : "anonymous"}`}
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
