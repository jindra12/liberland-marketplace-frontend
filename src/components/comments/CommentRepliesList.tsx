import * as React from "react";

import { Alert, Button, Flex, Spin, Typography } from "antd";

import { CommentCard } from "./CommentCard";
import type { CommentRepliesListProps } from "./types";
import { useCommentReplies } from "./useCommentReplies";

export const CommentRepliesList: React.FunctionComponent<CommentRepliesListProps> = (props) => {
    const nextDepth = (props.depth ?? 0) + 1;
    const { query: repliesQuery, replies, loadMore } = useCommentReplies(props);

    if (repliesQuery.isLoading && replies.length === 0) {
        return (
            <Flex justify="center" align="center" className="CommentRepliesList">
                <Spin size="small" />
            </Flex>
        );
    }

    if (replies.length === 0 && !repliesQuery.isError) {
        return null;
    }

    return (
        <Flex vertical gap={12} className="CommentRepliesList">
            <Typography.Text type="secondary" className="CommentRepliesList__title">
                Replies
            </Typography.Text>
            <Flex vertical gap={12} className="CommentRepliesList__items">
                {replies.map((reply) => (
                    <CommentCard
                        key={reply.id}
                        comment={reply}
                        currentUser={props.currentUser}
                        depth={nextDepth}
                        commentEditPlaceholder={props.commentEditPlaceholder}
                        commentReplyPlaceholder={props.commentReplyPlaceholder}
                        dislikeMutation={props.dislikeMutation}
                        likeMutation={props.likeMutation}
                        onDeleteAction={props.onDeleteAction}
                        onEditAction={props.onEditAction}
                        onReplyAction={props.onReplyAction}
                        onShare={props.onShare}
                    >
                        <CommentRepliesList
                            parentCommentId={reply.id}
                            serverURL={reply.serverUrl}
                            currentUser={props.currentUser}
                            depth={nextDepth}
                            commentEditPlaceholder={props.commentEditPlaceholder}
                            commentReplyPlaceholder={props.commentReplyPlaceholder}
                            dislikeMutation={props.dislikeMutation}
                            likeMutation={props.likeMutation}
                            onDeleteAction={props.onDeleteAction}
                            onEditAction={props.onEditAction}
                            onReplyAction={props.onReplyAction}
                            onShare={props.onShare}
                        />
                    </CommentCard>
                ))}
            </Flex>
            {repliesQuery.isError && (
                <Alert type="warning" message="Replies could not be loaded."
                    action={<Button onClick={() => repliesQuery.refetch()}>Retry replies</Button>} />
            )}
            {repliesQuery.data?.Comments?.hasNextPage && (
                <Button onClick={loadMore} loading={repliesQuery.isFetching} disabled={repliesQuery.isFetching}>
                    Load more replies
                </Button>
            )}
        </Flex>
    );
};
