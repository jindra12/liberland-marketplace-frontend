import * as React from "react";
import { Link } from "react-router-dom";
import { Typography } from "antd";
import {
    ListJobsByCompanyQuery,
    ListJobsBySecondaryIdentityQuery,
} from "../../generated/graphql";
import { AppList } from "../AppList";
import { EntitySubListSection } from "./EntitySubListSection";
import { Markdown } from "../Markdown";
import { IdentityAccessTags } from "../shared/IdentityAccessTags";
import { JobMetaTags } from "../shared/JobMetaTags";
import { getJobIdentityAccess, getJobMeta } from "../shared/jobDerived";

type CompanyJobItem = NonNullable<NonNullable<ListJobsByCompanyQuery["Jobs"]>["docs"]>[number];
type IdentityJobItem = NonNullable<NonNullable<ListJobsBySecondaryIdentityQuery["Jobs"]>["docs"]>[number];
type JobItem = CompanyJobItem | IdentityJobItem;

type JobsAppListProps = {
    title: string;
    items: JobItem[];
    hasMore: boolean;
    next: () => void;
    refetch: () => void;
    emptyText: string;
    showCompany?: boolean;
};

export const JobsAppList: React.FunctionComponent<JobsAppListProps> = (props) => {
    return (
        <EntitySubListSection title={props.title}>
            <AppList
                items={props.items}
                hasMore={props.hasMore}
                next={props.next}
                refetch={props.refetch}
                emptyText={props.emptyText}
                title="Jobs"
                renderItem={{
                    title: (job) => (
                        <Typography.Text strong className="EntitySubList__itemTitle" delete={job.isActive === false}>
                            <Link to={`/jobs/${job.id}`}>{job.title || "Untitled job"}</Link>
                        </Typography.Text>
                    ),
                    description: (job) => (
                        <Markdown className="Markdown--clamp2 EntitySubList__description">
                            {job.description}
                        </Markdown>
                    ),
                    body: (job) => {
                        const { bounty, positions, companyIdentity } = getJobMeta(job);
                        const { allowedIdentities, disallowedIdentities } = getJobIdentityAccess(job);

                        return (
                            <>
                                <JobMetaTags
                                    showCompany={props.showCompany}
                                    companyName={job.company?.name}
                                    companyIdentity={companyIdentity}
                                    positions={positions}
                                    bounty={bounty}
                                    isInactive={job.isActive === false}
                                    className="EntitySubList__meta"
                                />
                                <IdentityAccessTags
                                    allowedIdentities={allowedIdentities}
                                    disallowedIdentities={disallowedIdentities}
                                    className="EntitySubList__identities"
                                    hideWhenEmpty
                                    keyPrefix={job.id}
                                />
                            </>
                        );
                    },
                    actions: (job) => <Link to={`/jobs/${job.id}`}>Details</Link>,
                }}
            />
        </EntitySubListSection>
    );
};
