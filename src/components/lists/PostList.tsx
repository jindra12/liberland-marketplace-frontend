import * as React from "react";

import { useListPostsQuery } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";

import { PostListInternal } from "./PostListInternal";

export interface PostListProps {
    offset?: number;
    className?: string;
    titleHidden?: boolean;
}

export const PostList: React.FunctionComponent<PostListProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const query = useListPostsQuery({
        limit: 20,
        page,
        sort: "-contentRankScore",
    });
    const allItems = useAccumulatedDocs(query.data?.Posts?.docs, page);
    const visibleItems = props.offset === undefined ? allItems : allItems.slice(props.offset);

    return (
        <div className={`PostList${props.className ? ` ${props.className}` : ""}`}>
            <PostListInternal
                items={visibleItems}
                hasMore={Boolean(query.data?.Posts?.hasNextPage)}
                loading={query.isLoading}
                next={() => setPage(page + 1)}
                refetch={query.refetch}
                titleHidden={props.titleHidden}
            />
        </div>
    );
};
