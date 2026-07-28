import * as React from "react";

import { useListJobsByCompanyQuery } from "../hooks";

import { JobListInternal } from "./JobListInternal";

export interface CompanyJobsListProps {
    companyId: string;
    serverUrl?: string | null;
}

export const CompanyJobsList: React.FunctionComponent<CompanyJobsListProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const query = useListJobsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 20,
        url: props.serverUrl,
    });

    return <JobListInternal page={page} query={query} setPage={setPage} />;
};
