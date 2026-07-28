import * as React from "react";

import { Flex, Spin, Typography } from "antd";

import { ENTITY_COMMENTS_DEFAULT_LIMIT } from "../../constants";
import { useListCommentRepliesQuery } from "../hooks";

import { CommentCard } from "./CommentCard";
import type { CommentRepliesListProps } from "./types";

export const CommentRepliesList: React.FunctionComponent<CommentRepliesListProps> = (props) => {
    const nextDepth = (props.depth ?? 0) + 1;
    const repliesQuery = useListCommentRepliesQuery({
        parentCommentId: props.parentCommentId,
        limit: ENTITY_COMMENTS_DEFAULT_LIMIT,
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
        </Flex>
    );
};
