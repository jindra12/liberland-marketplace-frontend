import * as React from "react";

import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useListPostsByCompanyQuery } from "../hooks";

import { PostListInternal } from "./PostListInternal";

export interface CompanyPostsListProps {
    companyId: string;
    serverUrl?: string | null;
}

export const CompanyPostsList: React.FunctionComponent<CompanyPostsListProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const query = useListPostsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 20,
        url: props.serverUrl,
    });
    const allItems = useAccumulatedDocs(query.data?.Posts?.docs, page);

    return (
        <PostListInternal
            items={allItems}
            hasMore={Boolean(query.data?.Posts?.hasNextPage)}
            loading={query.isLoading}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
        />
    );
};
