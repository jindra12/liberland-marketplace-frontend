import * as React from "react";

import { useAuth } from "react-oidc-context";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";

import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Flex, Popconfirm, Typography, message } from "antd";

import { Comment_ReplyPostRelationshipInputRelationTo, Post, Company } from "../../generated/graphql";
import { decodeServerUrlSegment, routes } from "../../routes";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { useDeletePostMutation, useDislikePostMutation, useLikePostMutation, usePostByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { RouteButton } from "../RouteButton";
import { Like } from "../shared/Like/Like";
import { PostRepostLink } from "../shared/post/PostRepostLink";
import { getPostCompanyImageUrl, getPostRelatedTargetText } from "../shared/post/utils";

import { CommonDetail } from "./CommonDetail";
import { PostHeroSplash } from "./PostHeroSplash";

const PostDetail: React.FunctionComponent = () => {
    const { id, serverUrl } = useParams<{ id: string; serverUrl: string }>();
    const routeServerURL = decodeServerUrlSegment(serverUrl ?? "");
    const auth = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const query = usePostByIdQuery({ id: id!, url: routeServerURL });
    const likeMutation = useLikePostMutation();
    const dislikeMutation = useDislikePostMutation();
    const deleteMutation = useDeletePostMutation();

    const handleDelete = async (postId: string) => {
        try {
            await deleteMutation.mutateAsync({ id: postId });
            await queryClient.invalidateQueries({ queryKey: ["ListPosts"] });
            message.success("Post deleted");
            navigate(routes.posts.route);
        } catch (error) {
            console.error("Failed to delete post", error);
            message.error("Failed to delete post");
        }
    };

    return (
        <Loader query={query}>
            {(data) => {
                const post = data.Post;
                if (!post) {
                    return null;
                }

                const companyImageSrc = getPostCompanyImageUrl(post);
                const shareTitle = post.title ?? "Post";
                const shareText = `Check out ${shareTitle} on NSwap.`;
                const isOwner = auth.user?.profile?.sub && post.createdBy?.id === auth.user.profile.sub;
                const relatedTarget = post.relatedPosts?.[0];

                return (
                    <CommonDetail
                        className="PostDetail"
                        serverURL={post.company?.serverURL ?? routeServerURL}
                        reportPath={routes.posts.detail.getLink(post as Post)}
                        backTo={routes.posts.route}
                        backLabel="Back to posts"
                        shareTitle={shareTitle}
                        shareText={shareText}
                        header={
                            <Flex vertical gap={20} className="PostDetail__header">
                                <PostHeroSplash post={post} />
                                <Flex vertical gap={14} className="EntityDetail__headerBody PostDetail__headerBody">
                                    <div className="EntityDetail__titleBlock">
                                        <div className="EntityDetail__titleRow">
                                            <Typography.Title level={1} className="EntityDetail__title">
                                                {post.title}
                                            </Typography.Title>
                                        </div>
                                        <Flex vertical gap={8} className="PostDetail__metaStack">
                                            {post.company?.id && post.company?.name && (
                                                <Link
                                                    to={routes.companies.detail.getLink(post.company as Company)}
                                                    className="PostDetail__companyLink"
                                                >
                                                    <Flex gap={12} align="center" className="PostDetail__companyRow">
                                                        <Avatar
                                                            shape="square"
                                                            size={52}
                                                            src={companyImageSrc}
                                                            className="EntityList__avatar PostDetail__companyAvatar"
                                                        />
                                                        <Typography.Text className="PostDetail__companyName">
                                                            {post.company.name}
                                                        </Typography.Text>
                                                    </Flex>
                                                </Link>
                                            )}
                                            <PostRepostLink repost={post.repost} className="PostDetail__repostLink" />
                                        </Flex>
                                        {post.createdBy?.name && (
                                            <div className="PostDetail__creatorRow">
                                                <Typography.Text type="secondary">
                                                    <UserOutlined /> {post.createdBy.name}
                                                </Typography.Text>
                                            </div>
                                        )}
                                    </div>
                                </Flex>
                            </Flex>
                        }
                        beforeShare={
                            <>
                                <Flex gap={12} wrap align="center" className="PostDetail__actionsRow">
                                    <Like
                                        id={post.id}
                                        liked={post.hasLiked}
                                        likeCount={post.likeCount ?? 0}
                                        serverURL={post.company?.serverURL ?? routeServerURL}
                                        likeMutation={likeMutation}
                                        dislikeMutation={dislikeMutation}
                                        aria-label="Like post"
                                    />
                                    {isOwner && (
                                        <>
                                            <RouteButton
                                                to={routes.posts.edit.getLink(post as Post)}
                                                icon={<EditOutlined />}
                                                className="EntityDetail__editButton"
                                            >
                                                Edit
                                            </RouteButton>
                                            <Popconfirm
                                                title="Delete this post?"
                                                okText="Delete"
                                                okButtonProps={{ danger: true }}
                                                onConfirm={() => handleDelete(post.id)}
                                            >
                                                <Button danger loading={deleteMutation.isPending}>
                                                    Delete
                                                </Button>
                                            </Popconfirm>
                                        </>
                                    )}
                                </Flex>
                                <Divider />
                                <Markdown className="PostDetail__content">{post.content}</Markdown>
                                {relatedTarget && (
                                    <>
                                        <Divider />
                                        <Typography.Link href={routes.posts.relatedTarget.getLink(relatedTarget)}>
                                            Related: {getPostRelatedTargetText(relatedTarget)}
                                        </Typography.Link>
                                    </>
                                )}
                            </>
                        }
                        sections={[
                            {
                                key: "comments",
                                children: (
                                    <EntityCommentsSection
                                        targetId={id!}
                                        relationTo={Comment_ReplyPostRelationshipInputRelationTo.Posts}
                                        serverURL={post.company?.serverURL ?? routeServerURL}
                                    />
                                ),
                            },
                        ]}
                    />
                );
            }}
        </Loader>
    );
};

export default PostDetail;
