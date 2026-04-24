import * as React from "react";

import { Link, useParams } from "react-router-dom";

import { Alert, Flex, Skeleton, Typography } from "antd";

import { CommonDetail } from "../detail/CommonDetail";

import { CommentCard } from "./CommentCard";
import { CommentRepliesList } from "./CommentRepliesList";
import { useCommentDetailState } from "./useCommentDetailState";

const CommentDetail: React.FunctionComponent = () => {
    const params = useParams();
    const commentDetailState = useCommentDetailState({
        commentId: params.id ?? "",
    });

    if (commentDetailState.isLoading) {
        return (
            <Flex justify="center" align="center" className="CommentDetailPage">
                <Skeleton active avatar paragraph={{ rows: 4 }} />
            </Flex>
        );
    }

    if (!commentDetailState.comment) {
        return (
            <Flex justify="center" align="center" className="CommentDetailPage">
                <Alert
                    type="error"
                    showIcon
                    message="Comment not found"
                    description={<Link to="/">Return home</Link>}
                />
            </Flex>
        );
    }

    return (
        <Flex vertical gap={16} className="CommentDetailPage">
            <CommonDetail
                className="CommentDetailPage__detail"
                backTo="/"
                backLabel="Back home"
                header={
                    <Flex vertical gap={12} className="CommentDetailPage__header">
                        <Typography.Title level={1} className="EntityDetail__title">
                            Comment
                        </Typography.Title>
                    </Flex>
                }
                beforeShare={
                    <CommentCard
                        comment={commentDetailState.comment}
                        currentUser={commentDetailState.currentUser}
                        commentEditPlaceholder="Edit your comment..."
                        commentReplyPlaceholder="Write a reply..."
                        dislikeMutation={commentDetailState.dislikeMutation}
                        likeMutation={commentDetailState.likeMutation}
                        onDeleteAction={commentDetailState.onDeleteAction}
                        onEditAction={commentDetailState.onEditAction}
                        onReplyAction={commentDetailState.onReplyAction}
                        onShare={commentDetailState.handleShare}
                    >
                        <CommentRepliesList
                            parentCommentId={commentDetailState.comment.id}
                            serverURL={commentDetailState.comment.serverUrl}
                            currentUser={commentDetailState.currentUser}
                            commentEditPlaceholder="Edit your comment..."
                            commentReplyPlaceholder="Write a reply..."
                            dislikeMutation={commentDetailState.dislikeMutation}
                            likeMutation={commentDetailState.likeMutation}
                            onDeleteAction={commentDetailState.onDeleteAction}
                            onEditAction={commentDetailState.onEditAction}
                            onReplyAction={commentDetailState.onReplyAction}
                            onShare={commentDetailState.handleShare}
                        />
                    </CommentCard>
                }
                shareLabel="Share this comment"
                shareTitle="Comment"
                shareText="Check out this comment on NSwap."
            />
        </Flex>
    );
};

// eslint-disable-next-line import/no-default-export
export default CommentDetail;
