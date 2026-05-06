import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex, Grid, Image, Tag, Typography } from "antd";

import { Post } from "../../generated/graphql";
import { routes } from "../../routes";
import { AppList } from "../AppList";
import { useDislikePostMutation, useLikePostMutation } from "../hooks";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { PostRepostLink } from "../shared/post/PostRepostLink";
import { PostDoc } from "../shared/post/types";
import { getPostCompanyImageUrl, getPostHeroImageUrl, getPostRelatedTargetText } from "../shared/post/utils";

export interface PostListInternalProps {
    items: PostDoc[];
    hasMore: boolean;
    loading?: boolean;
    next: () => void;
    refetch: () => void;
    endMessage?: React.ReactNode;
    emptyText?: React.ReactNode;
    scrollableTarget?: string;
    titleHidden?: boolean;
}

export const PostListInternal: React.FunctionComponent<PostListInternalProps> = (props) => {
    const { md, xl } = Grid.useBreakpoint();
    const likeMutation = useLikePostMutation();
    const dislikeMutation = useDislikePostMutation();

    return (
        <AppList
            hasMore={props.hasMore}
            items={props.items}
            next={props.next}
            refetch={props.refetch}
            loading={Boolean(props.loading) && props.items.length === 0}
            title="Posts"
            likeActions={{
                likeMutation,
                dislikeMutation,
            }}
            emptyText={props.emptyText}
            endMessage={props.endMessage}
            scrollableTarget={props.scrollableTarget}
            titleHidden={props.titleHidden}
            renderItem={{
                title: (post) => <Link to={routes.posts.detail.getLink(post as Post)}>{post.title}</Link>,
                avatar: (post) => {
                    if (!xl) {
                        return undefined;
                    }

                    const imageSrc = getPostCompanyImageUrl(post);

                    return imageSrc ? (
                        <Link to={routes.posts.detail.getLink(post as Post)} className="PostList__companyAvatarLink">
                            <Avatar shape="square" size={112} src={imageSrc} className="EntityList__avatar PostList__companyAvatar" />
                        </Link>
                    ) : undefined;
                },
                cover: (post) => {
                    const imageSrc = getPostHeroImageUrl(post);
                    return imageSrc ? (
                        <Link to={routes.posts.detail.getLink(post as Post)} className="PostList__coverLink" aria-label={post.title ?? "Post"}>
                            <Image
                                preview={false}
                                src={imageSrc}
                                alt={post.title ?? "Post hero image"}
                                width="100%"
                                className="PostList__coverImage"
                            />
                        </Link>
                    ) : undefined;
                },
                description: (post) => (
                    <Flex vertical gap={8} align="start" className="PostList__meta">
                        <Typography.Paragraph className="EntityList__description PostList__description">
                            {post.meta?.description}
                        </Typography.Paragraph>
                        <PostRepostLink repost={post.repost} className="PostList__repostLink" />
                        {!xl && getPostCompanyImageUrl(post) && post.company?.name && (
                            <Link
                                to={routes.posts.detail.getLink(post as Post)}
                                className="PostList__companyInlineLink PostList__companyInlineLink--mobile"
                            >
                                <Avatar
                                    shape="square"
                                    size={32}
                                    src={getPostCompanyImageUrl(post)}
                                    className="EntityList__avatar PostList__companyAvatar PostList__companyAvatar--mobile"
                                />
                                <Typography.Text className="PostList__companyName PostList__companyName--mobile">
                                    {post.company.name}
                                </Typography.Text>
                            </Link>
                        )}
                        {xl && post.company?.name && <Tag className="PostList__companyTag">{post.company.name}</Tag>}
                        {post.relatedPosts?.[0] && (
                            <Typography.Link href={routes.posts.relatedTarget.getLink(post.relatedPosts[0])}>
                                Related: {getPostRelatedTargetText(post.relatedPosts[0])}
                            </Typography.Link>
                        )}
                    </Flex>
                ),
                actions: (post) =>
                    md ? (
                        <Flex gap="12px" wrap justify="flex-end" className="EntityList__actionsRow PostList__actionsRow">
                            <ListShareDetailButtons
                                detailPath={routes.posts.detail.getLink(post as Post)}
                                title={post.title}
                                text={`Check out ${post.title} on NSwap.`}
                            />
                        </Flex>
                    ) : (
                        <Flex vertical gap="12px" className="EntityList__actionsRow PostList__actionsRow">
                            <ListShareDetailButtons
                                compact
                                detailPath={routes.posts.detail.getLink(post as Post)}
                                title={post.title}
                                text={`Check out ${post.title} on NSwap.`}
                            />
                        </Flex>
                    ),
            }}
        />
    );
};
