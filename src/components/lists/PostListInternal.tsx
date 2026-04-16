import * as React from "react";

import { Link } from "react-router-dom";

import { UseQueryResult } from "@tanstack/react-query";

import { Avatar, Flex, Grid, Typography } from "antd";

import { ListPostsQuery } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { AppList } from "../AppList";
import { useDislikePostMutation, useLikePostMutation } from "../hooks";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { getPostHeroImageUrl, getPostRelatedTargetHref, getPostRelatedTargetText } from "../shared/post/utils";

export interface PostListInternalProps {
    query: UseQueryResult<ListPostsQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}

export const PostListInternal: React.FunctionComponent<PostListInternalProps> = (props) => {
    const { md } = Grid.useBreakpoint();
    const likeMutation = useLikePostMutation();
    const dislikeMutation = useDislikePostMutation();
    const allItems = useAccumulatedDocs(props.query.data?.Posts?.docs, props.page);

    return (
        <AppList
            hasMore={Boolean(props.query.data?.Posts?.hasNextPage)}
            items={allItems}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            loading={props.query.isLoading && allItems.length === 0}
            title="Posts"
            likeActions={{
                likeMutation,
                dislikeMutation,
            }}
            renderItem={{
                title: (post) => <Link to={`/posts/${post.id}`}>{post.title}</Link>,
                avatar: (post) => {
                    const imageSrc = getPostHeroImageUrl(post);

                    return imageSrc ? (
                        <Link to={`/posts/${post.id}`}>
                            <Avatar shape="square" size={112} src={imageSrc} className="EntityList__avatar" />
                        </Link>
                    ) : undefined;
                },
                description: (post) => (
                    <Flex vertical gap={8} className="PostList__meta">
                        <Typography.Paragraph className="EntityList__description PostList__description">
                            {post.meta?.description}
                        </Typography.Paragraph>
                        {post.relatedPosts?.[0] && (
                            <Typography.Link href={getPostRelatedTargetHref(post.relatedPosts[0])}>
                                Related: {getPostRelatedTargetText(post.relatedPosts[0])}
                            </Typography.Link>
                        )}
                    </Flex>
                ),
                actions: (post) =>
                    md ? (
                        <Flex gap="12px" wrap justify="flex-end" className="EntityList__actionsRow PostList__actionsRow">
                            <ListShareDetailButtons
                                detailPath={`/posts/${post.id}`}
                                title={post.title}
                                text={`Check out ${post.title} on NSwap.`}
                            />
                        </Flex>
                    ) : (
                        <Flex vertical gap="12px" className="EntityList__actionsRow PostList__actionsRow">
                            <ListShareDetailButtons
                                compact
                                detailPath={`/posts/${post.id}`}
                                title={post.title}
                                text={`Check out ${post.title} on NSwap.`}
                            />
                        </Flex>
                    ),
            }}
        />
    );
};
