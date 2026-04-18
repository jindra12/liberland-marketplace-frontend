import * as React from "react";

import { AnimatedIn } from "../shared/AnimatedIn/AnimatedIn";
import { PostDoc } from "../shared/post/types";

import { PostListInternal } from "./PostListInternal";

export interface SlicePostListProps {
    items: PostDoc[];
    offset: number;
    limit: number;
    title?: React.ReactNode;
    loading?: boolean;
    className?: string;
}

export const SlicePostList: React.FunctionComponent<SlicePostListProps> = (props) => {
    const visibleItems = props.items.slice(props.offset, props.offset + props.limit);

    if (!props.loading && visibleItems.length === 0) {
        return null;
    }

    return (
        <AnimatedIn>
            <div className={props.className}>
                <PostListInternal
                    items={visibleItems}
                    hasMore={false}
                    loading={props.loading}
                    next={() => undefined}
                    refetch={() => undefined}
                    title={props.title}
                    endMessage={<></>}
                />
            </div>
        </AnimatedIn>
    );
};
