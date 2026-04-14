import * as React from "react";

import type { DislikeMutation, LikeMutation } from "../shared/Like/types";

export type SplashCardItemProps = {
    id: string;
    detailPath: string;
    title: React.ReactNode;
    avatar?: React.ReactNode;
    liked?: boolean | null;
    likeCount?: number | null;
    serverURL?: string | null;
    likeActions?: {
        likeMutation: LikeMutation;
        dislikeMutation: DislikeMutation;
    };
    actions?: React.ReactNode[];
    children?: React.ReactNode;
};

export type SplashCardProps<TItem extends { id: string }> = {
    className: string;
    items: TItem[];
    loading?: boolean;
    renderItem: (item: TItem) => React.ReactNode;
};
