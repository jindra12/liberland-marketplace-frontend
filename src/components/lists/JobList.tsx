import * as React from "react";
import { useListJobsQuery } from "../../generated/graphql";
import { JobListInternal } from "./JobListInternal";

export interface JobListProps {
    limited?: boolean;
}

export const JobList: React.FunctionComponent<JobListProps> = (props) => {
    const [page, setPage] = React.useState(0);
    const query = useListJobsQuery({
        limit: 10,
        page,
    });

    return (
        <JobListInternal
            page={page}
            query={query}
            setPage={setPage}
            limited={props.limited}
        />
    )
};
