import * as React from "react";

import { useListPage } from "../../hooks/useListPage";
import { useListJobsByCompanyQuery } from "../hooks";

import { JobListInternal } from "./JobListInternal";

export interface CompanyJobsListProps {
    companyId: string;
    serverUrl?: string | null;
}

export const CompanyJobsList: React.FunctionComponent<CompanyJobsListProps> = (props) => {
    const { page, setPage } = useListPage(props.companyId, props.serverUrl);
    const query = useListJobsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 20,
        url: props.serverUrl,
    });

    return <JobListInternal page={page} query={query} setPage={setPage} />;
};
