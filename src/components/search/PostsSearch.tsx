import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Button, Flex, Tag, Typography } from "antd";

import { Post_RelatedPosts_RelationTo } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useDislikePostMutation, useLikePostMutation, useListPostsQuery, useSearchPostsQuery } from "../hooks";
import type { RelatedTargetSelection } from "../shared/post/types";
import { getPostHeroImageUrl, getPostRelatedTargetHref, getPostRelatedTargetText } from "../shared/post/utils";

import { SEARCH_DRAWER_SCROLLABLE_ID } from "./constants";
import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchPosts } from "./utils";

export interface PostsSearchProps {
    onClose: () => void;
    onSelect?: (value: RelatedTargetSelection) => void;
}

export const PostsSearch: React.FunctionComponent<PostsSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const [page, setPage] = React.useState(1);
    const defaultPosts = useListPostsQuery({
        limit: 5,
        page: 1,
    });
    const searchedPosts = useSearchPostsQuery(
        {
            searchTerm: submittedSearchValue,
            limit: 5,
            page,
        },
        {
            enabled: submittedSearchValue.length > 0,
        },
    );
    const searchPosts = mapSearchPosts(searchedPosts.data?.Searches?.docs);
    const accumulatedSearchPosts = useAccumulatedDocs(searchPosts, page);
    const items = submittedSearchValue.length > 0 ? accumulatedSearchPosts : defaultPosts.data?.Posts?.docs ?? [];
    const loading =
        submittedSearchValue.length > 0
            ? searchedPosts.isLoading && accumulatedSearchPosts.length === 0
            : defaultPosts.isLoading;
    const hasMore = submittedSearchValue.length > 0 ? Boolean(searchedPosts.data?.Searches?.hasNextPage) : false;
    const likeMutation = useLikePostMutation();
    const dislikeMutation = useDislikePostMutation();
    const handleSelect = (post: { id: string; title?: string | null }) => {
        props.onSelect?.({
            relationTo: Post_RelatedPosts_RelationTo.Posts,
            value: post.id,
            label: post.title || "Post",
        });
        props.onClose();
    };

    return (
        <SearchDrawer
            title="Post search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
                setPage(1);
            }}
            placeholder="Search posts"
        >
            <SearchResultsList
                title={submittedSearchValue.length > 0 ? `Search results for "${submittedSearchValue}"` : "Posts"}
                items={items}
                loading={loading}
                hasMore={hasMore}
                next={() => {
                    setPage((currentPage) => currentPage + 1);
                }}
                refetch={submittedSearchValue.length > 0 ? searchedPosts.refetch : defaultPosts.refetch}
                scrollableTarget={SEARCH_DRAWER_SCROLLABLE_ID}
                emptyText="No matching posts"
                likeActions={{
                    likeMutation,
                    dislikeMutation,
                }}
                renderItem={{
                    title: (post) => (
                        <Flex justify="space-between" align="center" wrap>
                            {props.onSelect ? (
                                <Button type="link" onClick={() => handleSelect(post)}>
                                    {post.title}
                                </Button>
                            ) : (
                                <Link to={`/posts/${post.id}`} onClick={props.onClose}>
                                    {post.title}
                                </Link>
                            )}
                        </Flex>
                    ),
                    avatar: (post) => {
                        const imageSrc = getPostHeroImageUrl(post);
                        return imageSrc ? (
                            props.onSelect ? (
                                <Button type="link" onClick={() => handleSelect(post)}>
                                    <Avatar shape="square" size={88} src={imageSrc} className="EntityList__avatar" />
                                </Button>
                            ) : (
                                <Link to={`/posts/${post.id}`} onClick={props.onClose}>
                                    <Avatar shape="square" size={88} src={imageSrc} className="EntityList__avatar" />
                                </Link>
                            )
                        ) : undefined;
                    },
                    description: (post) => (
                        <Flex vertical gap={8} className="PostList__meta">
                            {post.company?.name && <Tag>{post.company.name}</Tag>}
                            {post.meta?.description && (
                                <Typography.Paragraph className="EntityList__description PostList__description">
                                    {post.meta.description}
                                </Typography.Paragraph>
                            )}
                            {post.relatedPosts?.[0] && (
                                <Typography.Link href={getPostRelatedTargetHref(post.relatedPosts[0])}>
                                    Related: {getPostRelatedTargetText(post.relatedPosts[0])}
                                </Typography.Link>
                            )}
                        </Flex>
                    ),
                }}
            />
        </SearchDrawer>
    );
};
