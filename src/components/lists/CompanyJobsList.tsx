import * as React from "react";
import { useListJobsByCompanyQuery } from "../../generated/graphql";
import { JobListInternal } from "./JobListInternal";

export interface CompanyJobsListProps {
    companyId: string;
};

export const CompanyJobsList: React.FunctionComponent<CompanyJobsListProps> = (props) => {
    const [page, setPage] = React.useState(0);
    const query = useListJobsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 10,
    });

    return (
        <JobListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
