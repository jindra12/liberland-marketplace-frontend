import * as React from "react";

import { useListPostsQuery } from "../hooks";

import { PostListInternal } from "./PostListInternal";

export const PostList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(1);
    const query = useListPostsQuery({
        limit: 20,
        page,
    });

    return <PostListInternal page={page} query={query} setPage={setPage} />;
};
