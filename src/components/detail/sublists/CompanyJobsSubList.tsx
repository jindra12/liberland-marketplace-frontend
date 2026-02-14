import * as React from "react";
import { useListJobsByCompanyQuery } from "../../../generated/graphql";
import { Loader } from "../../Loader";
import { JobsSubList } from "./JobsSubList";

export interface CompanyJobsSubListProps {
    companyId: string;
}

export const CompanyJobsSubList: React.FunctionComponent<CompanyJobsSubListProps> = (props) => {
    const query = useListJobsByCompanyQuery({
        companyId: props.companyId,
        page: 1,
        limit: 10,
    });

    return (
        <Loader query={query}>
            {(data) => (
                <JobsSubList
                    title="Jobs"
                    jobs={data.Jobs?.docs || []}
                    emptyText="No jobs found for this company"
                />
            )}
        </Loader>
    );
};
