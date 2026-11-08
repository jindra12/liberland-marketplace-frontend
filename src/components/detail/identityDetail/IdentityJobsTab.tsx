import * as React from "react";

import { useListPage } from "../../../hooks/useListPage";
import { useListJobsByIdentityQuery } from "../../hooks";
import { JobListInternal } from "../../lists/JobListInternal";

import type { IdentityDetailTabProps } from "./types";

export const IdentityJobsTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    const { page, setPage } = useListPage(props.identityId, props.serverURL);
    const jobsQuery = useListJobsByIdentityQuery(
        { identityId: props.identityId, page, limit: 20, url: props.serverURL },
        { enabled: Boolean(props.identityId) },
    );

    return <JobListInternal page={page} query={jobsQuery} setPage={setPage} />;
};
