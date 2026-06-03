import * as React from "react";

import { Button } from "antd";

import { AppList } from "../AppList";
import type { DislikeMutation, LikeMutation } from "../shared/Like/types";

type SearchResultsListProps<TItem> = {
    title: React.ReactNode;
    items: TItem[];
    loading: boolean;
    refetch: () => void;
    hasMore: boolean;
    next: () => void;
    scrollableTarget: string;
    renderItem: Partial<
        Record<"title" | "extra" | "avatar" | "description" | "body" | "actions", (item: TItem) => React.ReactNode>
    >;
    emptyText?: React.ReactNode;
    likeActions?: {
        likeMutation: LikeMutation;
        dislikeMutation: DislikeMutation;
    };
    onSelectItem?: (item: TItem) => void;
    selectLabel?: string;
};

export const SearchResultsList = <TItem,>(props: SearchResultsListProps<TItem>) => {
    const selectLabel = props.selectLabel ?? "Select";

    return (
        <AppList
            hasMore={props.hasMore}
            items={props.items}
            next={props.next}
            scrollableTarget={props.scrollableTarget}
            refetch={props.refetch}
            title={props.title}
            loading={props.loading}
            emptyText={props.emptyText}
            titleHidden
            renderItem={{
                ...props.renderItem,
                actions: (item) => {
                    const existingActions = props.renderItem.actions?.(item);

                    if (!props.onSelectItem) {
                        return existingActions;
                    }

                    return (
                        <>
                            {existingActions}
                            <Button
                                type="primary"
                                onClick={() => {
                                    props.onSelectItem?.(item);
                                }}
                            >
                                {selectLabel}
                            </Button>
                        </>
                    );
                },
            }}
            likeActions={props.likeActions}
        />
    );
};
