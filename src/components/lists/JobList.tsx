import * as React from "react";

import { useListPage } from "../../hooks/useListPage";
import { useListJobsQuery } from "../hooks";

import { JobListInternal } from "./JobListInternal";

export interface JobListProps {
    limited?: boolean;
}

export const JobList: React.FunctionComponent<JobListProps> = (props) => {
    const { page, setPage } = useListPage();
    const query = useListJobsQuery({
        limit: 20,
        page,
    });

    return <JobListInternal page={page} query={query} setPage={setPage} limited={props.limited} />;
};
