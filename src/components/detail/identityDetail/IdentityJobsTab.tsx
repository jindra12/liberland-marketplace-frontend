import * as React from "react";

import { useListJobsByIdentityQuery } from "../../hooks";
import { JobListInternal } from "../../lists/JobListInternal";

import type { IdentityDetailTabProps } from "./types";

export const IdentityJobsTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const jobsQuery = useListJobsByIdentityQuery(
        { identityId: props.identityId, page, limit: 20, url: props.serverURL },
        { enabled: Boolean(props.identityId) },
    );

    return <JobListInternal page={page} query={jobsQuery} setPage={setPage} />;
};
