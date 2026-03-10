import * as React from "react";

import { JobListInternal } from "./JobListInternal";
import { useListJobsByCompanyQuery } from "../hooks";

export interface CompanyJobsListProps {
    companyId: string;
};

export const CompanyJobsList: React.FunctionComponent<CompanyJobsListProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const query = useListJobsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 20,
    });

    return (
        <JobListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
