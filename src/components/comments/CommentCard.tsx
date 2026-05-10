import * as React from "react";

import { useNavigate } from "react-router-dom";

import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    MessageOutlined,
    ShareAltOutlined,
    UpOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Flex, Typography } from "antd";

import { Comment } from "../../generated/graphql";
import { routes } from "../../routes";
import { EndpointAuthAction } from "../EndpointAuthAction";
import { ReportAction } from "../report/ReportAction";
import { AnimatedIn } from "../shared/AnimatedIn/AnimatedIn";
import { Like } from "../shared/Like/Like";

import { CommentEditComposer } from "./CommentEditComposer";
import { CommentReplyComposer } from "./CommentReplyComposer";
import type { CommentCardProps } from "./types";
import {
    getCommentAvatarUrl,
    getCommentDisplayName,
    getCommentTimestampText,
    isCommentOwnedByCurrentUser,
} from "./utils";

type CommentCardFormState = "idle" | "reply" | "edit";

export const CommentCard: React.FunctionComponent<React.PropsWithChildren<CommentCardProps>> = (props) => {
    const navigate = useNavigate();
    const [formState, setFormState] = React.useState<CommentCardFormState>("idle");
    const [areRepliesVisible, setAreRepliesVisible] = React.useState(false);
    const canManageComment = isCommentOwnedByCurrentUser(props.comment, props.currentUser.currentUserId);
    const replyCount = props.comment.replyCount ?? 0;
    const hasReplies = replyCount > 0;

    const startReply = () => {
        setFormState("reply");
    };

    const startEdit = () => {
        setFormState("edit");
    };

    const resetForm = () => {
        setFormState("idle");
    };

    const toggleReplies = () => {
        setAreRepliesVisible((currentValue) => !currentValue);
    };

    return (
        <Flex
            vertical
            gap={12}
            className={["CommentCard", props.depth ? "CommentCard--reply" : undefined].filter(Boolean).join(" ")}
            data-comment-id={props.comment.id}
        >
            <Flex gap={12} align="start" className="CommentCard__header">
                <Avatar
                    shape="square"
                    size={props.depth ? 36 : 48}
                    src={getCommentAvatarUrl(props.comment)}
                    className="CommentCard__avatar"
                />
                <Flex vertical gap={4} className="CommentCard__meta">
                    <Typography.Text className="CommentCard__author">{getCommentDisplayName(props.comment)}</Typography.Text>
                    {getCommentTimestampText(props.comment) && (
                        <Typography.Text type="secondary" className="CommentCard__timestamp">
                            {getCommentTimestampText(props.comment)}
                        </Typography.Text>
                    )}
                </Flex>
            </Flex>
            <Typography.Paragraph className="CommentCard__content">{props.comment.content}</Typography.Paragraph>
            <Flex gap={8} wrap align="center" className="CommentCard__actions">
                <Like
                    id={props.comment.id}
                    liked={props.comment.hasLiked}
                    likeCount={props.comment.likeCount ?? 0}
                    serverURL={props.comment.serverUrl}
                    likeMutation={props.likeMutation}
                    dislikeMutation={props.dislikeMutation}
                    className="CommentCard__like"
                    aria-label={`Like comment from ${getCommentDisplayName(props.comment)}`}
                />
                <EndpointAuthAction
                    defaultAuthUrl={props.comment.serverUrl ? props.comment.serverUrl : undefined}
                    requireVerifiedEmail
                    onUnverifiedEmail={() => navigate(routes.publish.route)}
                >
                    {({ runWithAuthOrLogin }) => (
                        <Button
                            type="text"
                            onClick={async (event) => {
                                event.preventDefault();
                                await runWithAuthOrLogin(async () => {
                                    startReply();
                                });
                            }}
                            className="CommentCard__actionBtn"
                            aria-label="Reply"
                        >
                            <MessageOutlined className="CommentCard__actionIcon" />
                            <span className="CommentCard__actionLabel">Reply</span>
                        </Button>
                    )}
                </EndpointAuthAction>
                <Button
                    type="text"
                    onClick={() => props.onShare(props.comment as Comment)}
                    className="CommentCard__actionBtn"
                    aria-label="Share"
                >
                    <ShareAltOutlined className="CommentCard__actionIcon" />
                    <span className="CommentCard__actionLabel">Share</span>
                </Button>
                <ReportAction
                    contentLink={routes.comments.detail.getLink(props.comment as Comment)}
                    serverURL={props.comment.serverUrl}
                    size="small"
                    className="CommentCard__actionBtn"
                />
                {hasReplies && (
                    <Button
                        type="text"
                        onClick={toggleReplies}
                        className="CommentCard__actionBtn CommentCard__repliesToggle"
                        aria-label={areRepliesVisible ? "Hide replies" : `Show replies (${replyCount})`}
                    >
                        <span className="CommentCard__actionLabel">
                            {areRepliesVisible ? "Hide replies" : `Show replies (${replyCount})`}
                        </span>
                        <span className="CommentCard__repliesToggleMeta">
                            {areRepliesVisible ? <UpOutlined /> : <DownOutlined />} ({replyCount})
                        </span>
                    </Button>
                )}
                {canManageComment && (
                    <Button type="text" onClick={startEdit} className="CommentCard__actionBtn" aria-label="Edit">
                        <EditOutlined className="CommentCard__actionIcon" />
                        <span className="CommentCard__actionLabel">Edit</span>
                    </Button>
                )}
                {canManageComment && (
                    <Button
                        type="text"
                        danger
                        onClick={() => props.onDeleteAction({ comIdToDelete: props.comment.id })}
                        className="CommentCard__actionBtn"
                        aria-label="Delete"
                    >
                        <DeleteOutlined className="CommentCard__actionIcon" />
                        <span className="CommentCard__actionLabel">Delete</span>
                    </Button>
                )}
            </Flex>
            {formState === "reply" && (
                <CommentReplyComposer
                    commentId={props.comment.id}
                    serverURL={props.comment.serverUrl}
                    placeholder={props.commentReplyPlaceholder}
                    onCancel={resetForm}
                    onReplyAction={props.onReplyAction}
                />
            )}
            {formState === "edit" && (
                <CommentEditComposer
                    commentId={props.comment.id}
                    initialValue={props.comment.content || ""}
                    initialCompany={props.comment.company?.id}
                    placeholder={props.commentEditPlaceholder}
                    onCancel={resetForm}
                    onEditAction={props.onEditAction}
                />
            )}
            {hasReplies && areRepliesVisible && (
                <AnimatedIn className="CommentCard__children">{props.children}</AnimatedIn>
            )}
        </Flex>
    );
};
