import * as React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Divider, Flex, List, Spin, Typography } from "antd";

export interface AppListProps<TItem> {
    items: TItem[];
    renderItem: Partial<Record<'title' | 'extra' | 'avatar' | 'description' | 'body' | 'actions', (item: TItem) => React.ReactNode>>;
    hasMore: boolean;
    refetch: () => void;
    next: () => void;
    title: React.ReactNode;
    filters?: React.ReactNode;
    emptyText?: React.ReactNode;
    loading?: boolean;
    endMessage?: React.ReactNode;
}

export const AppList = <TItem,>(props: AppListProps<TItem>) => {
    return (
        <InfiniteScroll
            dataLength={props.items.length}
            next={props.next}
            hasMore={props.hasMore}
            loader={<Flex justify="center" align="center"><Spin /></Flex>}
            endMessage={props.endMessage ?? (
                <div>
                    <Divider size="large" />
                    <Typography.Text type="secondary">No more results</Typography.Text>
                </div>
            )}
            scrollThreshold={0.7}
            refreshFunction={props.refetch}
            className="InfinityScroll"
        >
                <List
                    itemLayout="vertical"
                    dataSource={props.items}
                    size="large"
                    loading={props.loading}
                    header={(
                        <Flex justify="space-between" gap="16px" wrap align="center">
                            <Flex flex={6}>
                                <Typography.Title level={2} className="AppList__title">
                                    {props.title}
                                </Typography.Title>
                            </Flex>
                            <Flex flex={4} justify="flex-end">{props.filters}</Flex>
                        </Flex>
                    )}
                    locale={props.emptyText ? { emptyText: props.emptyText } : undefined}
                    renderItem={(item) => (
                        (() => {
                            const actions = props.renderItem["actions"]?.(item);
                            return (
                                <List.Item
                                    extra={props.renderItem["extra"]?.(item)}
                                    actions={actions ? [actions] : undefined}
                                >
                                    <List.Item.Meta
                                        title={props.renderItem["title"]?.(item)}
                                        description={props.renderItem["description"]?.(item)}
                                        avatar={props.renderItem["avatar"]?.(item)}
                                    />
                                    {props.renderItem["body"]?.(item)}
                                </List.Item>
                            );
                        })()
                    )}
                />
        </InfiniteScroll>
    );
};
