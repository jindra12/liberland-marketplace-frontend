import * as React from "react";

import { Flex, Spin, Typography } from "antd";

import { useListCommentRepliesQuery } from "../hooks";

import { CommentCard } from "./CommentCard";
import type { CommentRepliesListProps } from "./types";

export const CommentRepliesList: React.FunctionComponent<CommentRepliesListProps> = (props) => {
    const repliesQuery = useListCommentRepliesQuery({
        parentCommentId: props.parentCommentId,
        limit: 20,
        page: 1,
        url: props.serverURL,
    });

    const replies = repliesQuery.data?.Comments?.docs ?? [];

    if (repliesQuery.isLoading && replies.length === 0) {
        return (
            <Flex justify="center" align="center" className="CommentRepliesList">
                <Spin size="small" />
            </Flex>
        );
    }

    if (replies.length === 0) {
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
                        isAnonymous={props.isAnonymous}
                        depth={1}
                        commentEditPlaceholder={props.commentEditPlaceholder}
                        commentReplyPlaceholder={props.commentReplyPlaceholder}
                        dislikeMutation={props.dislikeMutation}
                        likeMutation={props.likeMutation}
                        onDeleteAction={props.onDeleteAction}
                        onEditAction={props.onEditAction}
                        onReplyAction={props.onReplyAction}
                        onShare={props.onShare}
                    />
                ))}
            </Flex>
        </Flex>
    );
};
