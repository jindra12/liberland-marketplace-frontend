import * as React from "react";

import { Avatar, Button, Flex, Typography } from "antd";

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
    const [formState, setFormState] = React.useState<CommentCardFormState>("idle");
    const canManageComment = isCommentOwnedByCurrentUser(props.comment, props.currentUser.currentUserId);

    const startReply = () => {
        setFormState("reply");
    };

    const startEdit = () => {
        setFormState("edit");
    };

    const resetForm = () => {
        setFormState("idle");
    };

    return (
        <Flex vertical gap={12} className={["CommentCard", props.depth ? "CommentCard--reply" : undefined].filter(Boolean).join(" ")}>
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
                <Button type="text" onClick={startReply} className="CommentCard__actionBtn">
                    Reply
                </Button>
                <Button type="text" onClick={() => props.onShare(props.comment.id)} className="CommentCard__actionBtn">
                    Share
                </Button>
                {canManageComment && (
                    <Button type="text" onClick={startEdit} className="CommentCard__actionBtn">
                        Edit
                    </Button>
                )}
                {canManageComment && (
                    <Button type="text" danger onClick={() => props.onDeleteAction({ comIdToDelete: props.comment.id })} className="CommentCard__actionBtn">
                        Delete
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
                    placeholder={props.commentEditPlaceholder}
                    onCancel={resetForm}
                    onEditAction={props.onEditAction}
                />
            )}
            {props.children}
        </Flex>
    );
};
