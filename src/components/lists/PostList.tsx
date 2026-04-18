import * as React from "react";

import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useListPostsQuery } from "../hooks";

import { PostListInternal } from "./PostListInternal";

export interface PostListProps {
    offset?: number;
    className?: string;
}

export const PostList: React.FunctionComponent<PostListProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const query = useListPostsQuery({
        limit: 20,
        page,
    });
    const allItems = useAccumulatedDocs(query.data?.Posts?.docs, page);
    const visibleItems = props.offset === undefined ? allItems : allItems.slice(props.offset);

    return (
        <div className={props.className}>
            <PostListInternal
                items={visibleItems}
                hasMore={Boolean(query.data?.Posts?.hasNextPage)}
                loading={query.isLoading}
                next={() => setPage(page + 1)}
                refetch={query.refetch}
            />
        </div>
    );
};
