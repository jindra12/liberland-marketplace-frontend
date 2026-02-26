import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex } from "antd";
import { ListJobsQuery } from "../../generated/graphql";
import { ApplyButton } from "../ApplyButton";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { formatSalary, formatEmploymentType } from "../../utils";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getJobMeta } from "../shared/jobDerived";
import { JobDetailsSummary } from "../shared/JobDetailsSummary";
import { UseQueryResult } from "@tanstack/react-query";

export interface JobListInternalProps {
    query: UseQueryResult<ListJobsQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
    limited?: boolean;
}

export const JobListInternal: React.FunctionComponent<JobListInternalProps> = (props) => {
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>([]);
    const allItems = props.query.data?.Jobs?.docs || [];
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((job) => {
            const identityIds = [
                ...(job.allowedIdentities?.map((i) => i.id) || []),
                ...(job.company?.allowedIdentities?.map((i) => i.id) || []),
                ...(job.company?.identity?.id ? [job.company.identity.id] : []),
            ];
            return selectedIdentityIds.some((id) => identityIds.includes(id));
        });

    return (
        <AppList
            hasMore={!props.limited && (!props.query.data?.Jobs || props.query.data.Jobs.hasNextPage)}
            items={items}
            title="Jobs"
            next={() => props.setPage(props.page + 1)}
            loading={props.query.isLoading}
            refetch={props.query.refetch}
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (job) => (
                    <Flex justify="space-between" align="center" wrap>
                        {job.title}
                        {job.company?.identity?.name && (
                            <IdentityTagLink identity={job.company.identity} color="success" />
                        )}
                    </Flex>
                ),
                avatar: (job) => {
                    const url = job.image?.url || job.company?.image?.url;
                    return url ? (
                        <Link to={`/jobs/${job.id}`}>
                            <Avatar
                                shape="square"
                                size={80}
                                src={`${BACKEND_URL}${url}`}
                                alt={job.title || ""}
                                className="EntityList__avatar"
                            />
                        </Link>
                    ) : undefined;
                },
                description: (job) => {
                    const salary = formatSalary(
                        job.salaryRange?.min,
                        job.salaryRange?.max,
                        job.salaryRange?.currency
                    );
                    const { bounty, positions } = getJobMeta(job);
                    const isInactive = job.isActive === false;
                    const employmentType = formatEmploymentType(job.employmentType);
                    const postedAt = typeof job.postedAt === "string" ? job.postedAt : undefined;
                    return (
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
                    );
                },
                body: (job) => (
                    <div className="JobList__description">
                        <Markdown className="Markdown--clamp3">{job.description}</Markdown>
                    </div>
                ),
                actions: (job) => (
                    <Flex wrap gap="32px" align="center">
                        <Link to={`/jobs/${job.id}`}><Button size="large" className="ActionBtn">Details</Button></Link>
                        <ApplyButton url={job.applyUrl} />
                    </Flex>
                ),
            }}
        />
    );
};
