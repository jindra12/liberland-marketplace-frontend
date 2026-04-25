import * as React from "react";

import InfiniteScroll from "react-infinite-scroll-component";

import { Button, Divider, Flex, Space, Spin, Typography, message } from "antd";

import {
    ENTITY_COMMENTS_DEFAULT_PLACEHOLDER,
    ENTITY_COMMENTS_EDIT_PLACEHOLDER,
    ENTITY_COMMENTS_REPLY_PLACEHOLDER,
} from "../../constants";
import { Comment } from "../../generated/graphql";

import { CommentCard } from "./CommentCard";
import { CommentCreateComposer } from "./CommentCreateComposer";
import { CommentRepliesList } from "./CommentRepliesList";
import type { EntityCommentsSectionDisplayProps } from "./types";
import { copyCommentLink } from "./utils";

export const EntityCommentsSectionDisplay: React.FunctionComponent<EntityCommentsSectionDisplayProps> = (props) => {
    const handleShare = async (comment: Comment) => {
        try {
            await copyCommentLink(comment);
            message.success("Comment link copied");
        } catch (error) {
            console.error("Failed to copy comment link", error);
        }
    };

    if (props.isLoading) {
        return (
            <Flex justify="center" align="center" className="EntityCommentsSection">
                <Spin />
            </Flex>
        );
    }

    if (props.isError) {
        return (
            <Typography.Text type="danger" className="EntityCommentsSection">
                Failed to load comments. Try refreshing the page.
            </Typography.Text>
        );
    }

    return (
        <Flex
            vertical
            gap={16}
            className={["EntityCommentsSection", props.isAnonymous && "EntityCommentsSection--anonymous", props.className]
                .filter(Boolean)
                .join(" ")}
        >
            <Flex vertical gap={12} className="EntityCommentsSection__header">
                <Flex align="center" justify="space-between" gap={12} wrap>
                    <Typography.Title level={4} className="EntityCommentsSection__title">
                        Comments{props.commentsCount !== undefined ? ` (${props.commentsCount})` : ""}
                    </Typography.Title>
                    {props.isAnonymous && (
                        <Space wrap className="EntityCommentsSection__authActions">
                            <Button onClick={props.onLogin}>Log in</Button>
                            <Button type="primary" onClick={props.onSignUp}>
                                Sign up
                            </Button>
                        </Space>
                    )}
                </Flex>
                <CommentCreateComposer
                    serverURL={props.serverURL}
                    placeholder={ENTITY_COMMENTS_DEFAULT_PLACEHOLDER}
                    submitLabel="Comment"
                    onSubmitAction={props.onSubmitAction}
                />
            </Flex>
            <InfiniteScroll
                dataLength={props.rootComments.length}
                next={props.onLoadMore}
                hasMore={props.hasMore}
                loader={
                    <Flex justify="center" align="center" className="EntityCommentsSection__loader">
                        <Spin />
                    </Flex>
                }
                endMessage={
                    <div>
                        <Divider size="large" />
                        <Typography.Text type="secondary">No more comments</Typography.Text>
                    </div>
                }
                scrollThreshold={0.75}
                className="InfinityScroll"
            >
                <Flex vertical gap={16} className="EntityCommentsSection__list">
                    {props.rootComments.map((comment) => (
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            currentUser={props.currentUser}
                            commentEditPlaceholder={ENTITY_COMMENTS_EDIT_PLACEHOLDER}
                            commentReplyPlaceholder={ENTITY_COMMENTS_REPLY_PLACEHOLDER}
                            dislikeMutation={props.dislikeMutation}
                            likeMutation={props.likeMutation}
                            onDeleteAction={props.onDeleteAction}
                            onEditAction={props.onEditAction}
                            onReplyAction={props.onReplyAction}
                            onShare={handleShare}
                        >
                            <CommentRepliesList
                                parentCommentId={comment.id}
                                serverURL={comment.serverUrl}
                                currentUser={props.currentUser}
                                commentEditPlaceholder={ENTITY_COMMENTS_EDIT_PLACEHOLDER}
                                commentReplyPlaceholder={ENTITY_COMMENTS_REPLY_PLACEHOLDER}
                                dislikeMutation={props.dislikeMutation}
                                likeMutation={props.likeMutation}
                                onDeleteAction={props.onDeleteAction}
                                onEditAction={props.onEditAction}
                                onReplyAction={props.onReplyAction}
                                onShare={handleShare}
                            />
                        </CommentCard>
                    ))}
                </Flex>
            </InfiniteScroll>
        </Flex>
    );
};
