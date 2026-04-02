import * as React from "react";

import { Link } from "react-router-dom";

import { UseQueryResult } from "@tanstack/react-query";

import { Avatar, Flex, Grid } from "antd";

import { ListJobsQuery } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useIdentityFilter } from "../../hooks/useIdentityFilter";
import { AppList } from "../AppList";
import { ApplyButton } from "../ApplyButton";
import { Markdown } from "../Markdown";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";
import { formatEmploymentType, formatSalary } from "../shared/job/utils";
import { getJobMeta } from "../shared/jobDerived";
import { JobDetailsSummary } from "../shared/JobDetailsSummary";

export interface JobListInternalProps {
    query: UseQueryResult<ListJobsQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
    limited?: boolean;
}

export const JobListInternal: React.FunctionComponent<JobListInternalProps> = (props) => {
    const { md } = Grid.useBreakpoint();
    const allItems = useAccumulatedDocs(props.query.data?.Jobs?.docs, props.page);
    const { items, hasMore, endMessage, filterNode } = useIdentityFilter({
        allItems,
        hasNextPage: !props.limited && Boolean(props.query.data?.Jobs?.hasNextPage),
        getIdentityIds: (job) => [
            ...(job.allowedIdentities?.map((i) => i.id) || []),
            ...(job.company?.allowedIdentities?.map((i) => i.id) || []),
            ...(job.company?.identity?.id ? [job.company.identity.id] : []),
        ],
        isLoading: props.query.isLoading,
        isFetching: props.query.isFetching,
        page: props.page,
        setPage: props.setPage,
    });

    return (
        <AppList
            hasMore={hasMore}
            items={items}
            title="Jobs"
            next={() => props.setPage(props.page + 1)}
            loading={props.query.isLoading && allItems.length === 0}
            refetch={props.query.refetch}
            filters={filterNode}
            endMessage={endMessage}
            renderItem={{
                title: (job) => (
                    <Flex justify="space-between" align="center" wrap>
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        {job.company?.identity?.name && (
                            <IdentityTagLink identity={job.company.identity} color="success" />
                        )}
                    </Flex>
                ),
                avatar: (job) => {
                    const imageSrc = getImage(job) || getImage(job.company);
                    return imageSrc ? (
                        <Link to={`/jobs/${job.id}`}>
                            <Avatar
                                shape="square"
                                size={80}
                                src={imageSrc}
                                alt={job.title || ""}
                                className="EntityList__avatar"
                            />
                        </Link>
                    ) : undefined;
                },
                body: (job) => {
                    const salary = formatSalary(job.salaryRange?.min, job.salaryRange?.max, job.salaryRange?.currency);
                    const { bounty, positions } = getJobMeta(job);
                    const isInactive = job.isActive === false;
                    const employmentType = formatEmploymentType(job.employmentType);
                    const postedAt = typeof job.postedAt === "string" ? job.postedAt : undefined;

                    return (
                        <div className="EntityList__body JobList__body">
                            <JobDetailsSummary
                                companyName={job.company?.name}
                                companyId={job.company?.id}
                                location={job.location}
                                employmentType={employmentType}
                                salary={salary}
                                bounty={bounty}
                                positions={positions}
                                postedAt={postedAt}
                                isInactive={isInactive}
                                showCompanyIcon
                                metaSize={[8, 4]}
                            />
                            <Markdown className="Markdown--clamp3 EntityList__description">{job.description}</Markdown>
                        </div>
                    );
                },
                actions: (job) =>
                    md ? (
                        <Flex wrap gap="32px" align="center" justify="flex-end" className="EntityList__actionsRow">
                            <ListShareDetailButtons
                                detailPath={`/jobs/${job.id}`}
                                title={job.title}
                                text={`Check out ${job.title} on NSwap.`}
                                subscriptionTarget={{
                                    collection: "jobs",
                                    targetID: job.id,
                                    serverURL: job.serverURL,
                                    isSubscribed: job.isSubscribed,
                                }}
                            />
                            <ApplyButton url={job.applyUrl} />
                        </Flex>
                    ) : (
                        <Flex vertical gap="12px" className="EntityList__actionsRow JobList__actionsRow">
                            <ListShareDetailButtons
                                compact
                                detailPath={`/jobs/${job.id}`}
                                title={job.title}
                                text={`Check out ${job.title} on NSwap.`}
                                subscriptionTarget={{
                                    collection: "jobs",
                                    targetID: job.id,
                                    serverURL: job.serverURL,
                                    isSubscribed: job.isSubscribed,
                                }}
                            />
                            <ApplyButton url={job.applyUrl} block />
                        </Flex>
                    ),
            }}
        />
    );
};
