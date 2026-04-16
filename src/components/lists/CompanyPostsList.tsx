import * as React from "react";

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

    return <PostListInternal page={page} query={query} setPage={setPage} />;
};
