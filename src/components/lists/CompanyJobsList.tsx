import * as React from "react";
import { useListJobsByCompanyQuery } from "../../generated/graphql";
import { JobsAppList } from "./JobsAppList";

type CompanyJobsListProps = {
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
        <JobsAppList
            title="Jobs"
            items={query.data?.Jobs?.docs || []}
            hasMore={!query.data?.Jobs || query.data.Jobs.hasNextPage}
            next={() => setPage((prev) => prev + 1)}
            refetch={query.refetch}
            emptyText="No jobs found for this company"
        />
    );
};
