import * as React from "react";

import { AppList } from "../AppList";

type SearchResultsListProps<TItem> = {
    title: React.ReactNode;
    items: TItem[];
    loading: boolean;
    refetch: () => void;
    renderItem: Partial<
        Record<"title" | "extra" | "avatar" | "description" | "body" | "actions", (item: TItem) => React.ReactNode>
    >;
    emptyText?: React.ReactNode;
};

export const SearchResultsList = <TItem,>(props: SearchResultsListProps<TItem>) => {
    return (
        <AppList
            hasMore={false}
            items={props.items}
            next={() => {}}
            refetch={props.refetch}
            title={props.title}
            loading={props.loading}
            emptyText={props.emptyText}
            renderItem={props.renderItem}
        />
    );
};
