import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex } from "antd";

import { useListJobsQuery, useSearchJobsQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";
import { formatEmploymentType, formatSalary } from "../shared/job/utils";
import { getJobMeta } from "../shared/jobDerived";
import { JobDetailsSummary } from "../shared/JobDetailsSummary";

import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchJobs } from "./utils";

export interface JobSearchProps {
    onClose: () => void;
}

export const JobSearch: React.FunctionComponent<JobSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const defaultJobs = useListJobsQuery({
        limit: 5,
        page: 1,
    });
    const searchedJobs = useSearchJobsQuery(
        {
            searchTerm: submittedSearchValue,
            limit: 5,
            page: 1,
        },
        {
            enabled: submittedSearchValue.length > 0,
        },
    );
    const items =
        submittedSearchValue.length > 0
            ? mapSearchJobs(searchedJobs.data?.Searches?.docs)
            : defaultJobs.data?.Jobs?.docs ?? [];
    const loading = submittedSearchValue.length > 0 ? searchedJobs.isLoading : defaultJobs.isLoading;

    return (
        <SearchDrawer
            title="Job search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
            }}
            placeholder="Search jobs"
        >
            <SearchResultsList
                title={
                    submittedSearchValue.length > 0 ? `Search results for "${submittedSearchValue}"` : "Jobs"
                }
                items={items}
                loading={loading}
                refetch={submittedSearchValue.length > 0 ? searchedJobs.refetch : defaultJobs.refetch}
                emptyText="No matching jobs"
                renderItem={{
                    title: (job) => (
                        <Flex justify="space-between" align="center" wrap>
                            <Link to={`/jobs/${job.id}`} onClick={props.onClose}>
                                {job.title}
                            </Link>
                            {job.company?.identity?.name && (
                                <IdentityTagLink identity={job.company.identity} color="success" />
                            )}
                        </Flex>
                    ),
                    avatar: (job) => {
                        const imageSrc = getImage(job) || getImage(job.company);
                        return imageSrc ? (
                            <Link to={`/jobs/${job.id}`} onClick={props.onClose}>
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
                        const salary = formatSalary(
                            job.salaryRange?.min,
                            job.salaryRange?.max,
                            job.salaryRange?.currency,
                        );
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
                }}
            />
        </SearchDrawer>
    );
};
