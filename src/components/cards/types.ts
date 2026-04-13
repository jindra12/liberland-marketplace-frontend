import * as React from "react";

import type { DislikeMutation, LikeMutation } from "../shared/Like/types";

export type SplashCardItemProps = {
    id: string;
    liked?: boolean | null;
    likeCount?: number | null;
    serverURL?: string | null;
    likeActions?: {
        likeMutation: LikeMutation;
        dislikeMutation: DislikeMutation;
    };
    actions?: React.ReactNode[];
    children: React.ReactNode;
};

export type SplashCardProps<TItem> = {
    className: string;
    title: string;
    titleRoute: string;
    items: TItem[];
    loading?: boolean;
    emptyText?: string;
    totalDocs?: number;
    identityId?: string;
    buildMoreLinkRoute: (identityId: string) => string;
    renderItem: (item: TItem) => React.ReactNode;
};
