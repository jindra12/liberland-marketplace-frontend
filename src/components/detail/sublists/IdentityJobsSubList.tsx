import * as React from "react";
import { useListJobsBySecondaryIdentityQuery } from "../../../generated/graphql";
import { Loader } from "../../Loader";
import { JobsSubList } from "./JobsSubList";

export interface IdentityJobsSubListProps {
    identityId: string;
}

export const IdentityJobsSubList: React.FunctionComponent<IdentityJobsSubListProps> = (props) => {
    const query = useListJobsBySecondaryIdentityQuery({
        identityId: props.identityId,
        page: 1,
        limit: 10,
    });

    return (
        <Loader query={query}>
            {(data) => (
                <JobsSubList
                    title="Jobs"
                    jobs={data.Jobs?.docs || []}
                    emptyText="No jobs found for this identity"
                    showCompany
                />
            )}
        </Loader>
    );
};
