import * as React from "react";

import InfiniteScroll from "react-infinite-scroll-component";
import { CommentSection } from "react-comments-section";

import { Alert, Divider, Flex, Spin, Typography } from "antd";

import "react-comments-section/dist/index.css";

import { ENTITY_COMMENTS_DEFAULT_PLACEHOLDER } from "../../constants";
import type { EntityCommentsSectionDisplayProps } from "../../types";

export const EntityCommentsSectionDisplay: React.FunctionComponent<EntityCommentsSectionDisplayProps> = (props) => {
    if (props.isLoading) {
        return (
            <Flex justify="center" align="center" className="EntityCommentsSection">
                <Spin />
            </Flex>
        );
    }

    if (props.isError) {
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

    const content = (
        <CommentSection
            key={`${props.className ?? "comments"}-${props.isAnonymous ? "anonymous" : "auth"}`}
            currentUser={props.currentUser}
            logIn={{
                onLogin: props.onLogin,
                onSignUp: props.onSignUp,
            }}
            commentData={props.commentData}
            placeHolder={ENTITY_COMMENTS_DEFAULT_PLACEHOLDER}
            showTimestamp
            overlayStyle={props.commentSectionStyles.overlayStyle}
            formStyle={props.commentSectionStyles.formStyle}
            inputStyle={props.commentSectionStyles.inputStyle}
            replyInputStyle={props.commentSectionStyles.replyInputStyle}
            submitBtnStyle={props.commentSectionStyles.submitBtnStyle}
            cancelBtnStyle={props.commentSectionStyles.cancelBtnStyle}
            hrStyle={props.commentSectionStyles.hrStyle}
            titleStyle={props.commentSectionStyles.titleStyle}
            onSubmitAction={props.onSubmitAction}
            onReplyAction={props.onReplyAction}
            onEditAction={props.onEditAction}
            onDeleteAction={props.onDeleteAction}
            commentsCount={props.commentsCount}
        />
    );

    return (
        <div
            className={["EntityCommentsSection", props.isAnonymous && "EntityCommentsSection--anonymous", props.className]
                .filter(Boolean)
                .join(" ")}
            style={props.commentThemeVars}
        >
            <InfiniteScroll
                dataLength={props.commentData.length}
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
                {content}
            </InfiniteScroll>
        </div>
    );
};
