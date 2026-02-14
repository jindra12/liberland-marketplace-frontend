import * as React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Flex, List, Spin, Typography } from "antd";
import uniqueId from "lodash-es/uniqueId";

export interface AppListProps<TItem> {
    items: TItem[];
    renderItem: Partial<Record<'title' | 'extra' | 'avatar' | 'description' | 'body' | 'actions', (item: TItem) => React.ReactNode>>;
    hasMore: boolean;
    refetch: () => void;
    next: () => void;
}

export const AppList = <TItem,>(props: AppListProps<TItem>) => {
    const id = React.useMemo(() => uniqueId("infinite"), []);

    return (
        <div id={id}>
            <InfiniteScroll
                dataLength={props.items.length}
                next={props.next}
                hasMore={props.hasMore}
                loader={<Flex justify="center" align="center"><Spin /></Flex>}
                endMessage={<Typography.Text type="secondary">No more results</Typography.Text>}
                scrollableTarget={id}
                refreshFunction={props.refetch}
                className="InfinityScroll"
            >
                <List
                    itemLayout="vertical"
                    dataSource={props.items}
                    size="large"
                    renderItem={(item) => (
                        <List.Item
                            extra={props.renderItem["extra"]?.(item)}
                            actions={[props.renderItem["actions"]?.(item)]}
                        >
                            <List.Item.Meta
                                title={props.renderItem["title"]?.(item)}
                                description={props.renderItem["description"]?.(item)}
                                avatar={props.renderItem["avatar"]?.(item)}
                            />
                            {props.renderItem["body"]?.(item)}
                        </List.Item>
                    )}
                />
            </InfiniteScroll>
        </div>
    );
};