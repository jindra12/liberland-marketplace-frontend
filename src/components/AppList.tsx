import * as React from "react";

import InfiniteScroll from "react-infinite-scroll-component";

import { Card, Divider, Flex, Grid, List, Spin, Typography } from "antd";

import { CollectionListSkeleton } from "./LoadingSkeleton/CollectionListSkeleton";
import { AnimatedIn } from "./shared/AnimatedIn/AnimatedIn";
import { Like } from "./shared/Like/Like";
import type { DislikeMutation, LikeMutation } from "./shared/Like/types";

interface AppListLikeItem {
    id?: string;
    likeCount?: number | null;
    hasLiked?: boolean | null;
    serverURL?: string | null;
}

export interface AppListProps<TItem> {
    items: TItem[];
    renderItem: Partial<
        Record<"title" | "extra" | "avatar" | "cover" | "description" | "body" | "actions", (item: TItem) => React.ReactNode> & {
            like?: (item: TItem) => React.ReactNode;
        }
    >;
    hasMore: boolean;
    refetch: () => void;
    next: () => void;
    title: React.ReactNode;
    filters?: React.ReactNode;
    emptyText?: React.ReactNode;
    loading?: boolean;
    endMessage?: React.ReactNode;
    scrollableTarget?: string;
    titleHidden?: boolean;
    likeActions?: {
        likeMutation: LikeMutation;
        dislikeMutation: DislikeMutation;
    };
}

export const AppList = <TItem,>(props: AppListProps<TItem>) => {
    const { md } = Grid.useBreakpoint();

    if (props.loading && props.items.length === 0) {
        return <CollectionListSkeleton />;
    }

    return (
        <InfiniteScroll
            dataLength={props.items.length}
            next={props.next}
            hasMore={props.hasMore}
            scrollableTarget={props.scrollableTarget}
            loader={
                <Flex justify="center" align="center">
                    <Spin />
                </Flex>
            }
            endMessage={
                props.endMessage ?? (
                    <div>
                        <Divider size="large" />
                        <Typography.Text type="secondary">No more results</Typography.Text>
                    </div>
                )
            }
            scrollThreshold={0.7}
            refreshFunction={props.refetch}
            className="InfinityScroll"
        >
            <List
                itemLayout="vertical"
                dataSource={props.items}
                size="large"
                loading={props.loading}
                header={
                    <Flex justify="space-between" gap="16px" wrap align="center" className="AppList__header">
                        <Flex className="AppList__titleSlot">
                            <Typography.Title
                                level={2}
                                className={`AppList__title${props.titleHidden ? " screen-reader-only" : ""}`}
                            >
                                {props.title}
                            </Typography.Title>
                        </Flex>
                        <Flex justify="flex-end" className="AppList__filters">
                            {props.filters}
                        </Flex>
                    </Flex>
                }
                locale={props.emptyText ? { emptyText: props.emptyText } : undefined}
                renderItem={(item) =>
                    (() => {
                        const likeItem = item as TItem & AppListLikeItem;
                        const like = props.likeActions ? (
                            <Like
                                id={likeItem.id ?? ""}
                                liked={likeItem.hasLiked}
                                likeCount={likeItem.likeCount ?? 0}
                                serverURL={likeItem.serverURL}
                                likeMutation={props.likeActions.likeMutation}
                                dislikeMutation={props.likeActions.dislikeMutation}
                            />
                        ) : undefined;
                        const actions = props.renderItem["actions"]?.(item);
                        const actionContent = [like, actions].filter(Boolean);
                        const wrappedActions =
                            actionContent.length > 0 ? (
                                <Flex
                                    vertical={!md}
                                    justify={md ? "flex-end" : undefined}
                                    align={md ? "center" : "flex-start"}
                                    gap="12px"
                                    className={`AppList__actions${md ? "" : " AppList__actions--stacked"}`}
                                >
                                    {actionContent}
                                </Flex>
                            ) : undefined;
                        const cover = props.renderItem["cover"]?.(item);
                        const itemContent = (
                            <>
                                {props.renderItem["extra"]?.(item)}
                                <List.Item.Meta
                                    title={props.renderItem["title"]?.(item)}
                                    description={props.renderItem["description"]?.(item)}
                                    avatar={props.renderItem["avatar"]?.(item)}
                                />
                                {props.renderItem["body"]?.(item)}
                                {wrappedActions}
                            </>
                        );

                        if (cover) {
                            return (
                                <List.Item className="AppList__cardItem">
                                    <AnimatedIn className="AppList__itemReveal">
                                        <Card
                                            className="AppList__card"
                                            cover={<div className="AppList__cardCover">{cover}</div>}
                                        >
                                            {itemContent}
                                        </Card>
                                    </AnimatedIn>
                                </List.Item>
                            );
                        }

                        return (
                            <List.Item
                                extra={props.renderItem["extra"]?.(item)}
                                actions={wrappedActions ? [wrappedActions] : undefined}
                            >
                                <AnimatedIn className="AppList__itemReveal">
                                    <List.Item.Meta
                                        title={props.renderItem["title"]?.(item)}
                                        description={props.renderItem["description"]?.(item)}
                                        avatar={props.renderItem["avatar"]?.(item)}
                                    />
                                    {props.renderItem["body"]?.(item)}
                                </AnimatedIn>
                            </List.Item>
                        );
                    })()
                }
            />
        </InfiniteScroll>
    );
};
