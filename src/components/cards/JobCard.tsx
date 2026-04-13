import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, List, Space, Tag } from "antd";

import { ListJobsQuery } from "../../generated/graphql";
import { useDislikeJobMutation, useLikeJobMutation } from "../hooks";
import { getImage } from "../shared/image/utils";
import { formatEmploymentType, formatSalary } from "../shared/job/utils";

import { SplashCard } from "./SplashCard";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type JobItem = NonNullable<NonNullable<ListJobsQuery["Jobs"]>["docs"]>[number];
type JobCardProps = {
    items: JobItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};
export const JobCard: React.FunctionComponent<JobCardProps> = (props) => {
    const likeMutation = useLikeJobMutation();
    const dislikeMutation = useDislikeJobMutation();
    return (
        <SplashCard
            className="SplashEntityCard--jobs"
            title="Jobs"
            titleRoute="/jobs"
            items={props.items}
            loading={props.loading}
            totalDocs={props.totalDocs}
            identityId={props.identityId}
            buildMoreLinkRoute={(identityId) => `/jobs?tribe=${identityId}`}
            renderItem={(job) => {
                const employmentType = formatEmploymentType(job.employmentType);
                const salary = formatSalary(job.salaryRange?.min, job.salaryRange?.max, job.salaryRange?.currency);
                const imageSrc = getImage(job) || getImage(job.company);
                return (
                    <SplashCardItem
                        id={job.id}
                        liked={job.hasLiked}
                        likeCount={job.likeCount}
                        serverURL={job.serverURL}
                        likeActions={{
                            likeMutation,
                            dislikeMutation,
                        }}
                        actions={[
                            <SplashShareDetailActionRow
                                key={`job-actions-${job.id}`}
                                detailPath={`/jobs/${job.id}`}
                                title={job.title || "Job"}
                                text={`Check out ${job.title} on NSwap.`}
                            />,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                imageSrc ? (
                                    <Link to={`/jobs/${job.id}`}>
                                        <Avatar
                                            shape="square"
                                            size={48}
                                            src={imageSrc}
                                            className="SplashEntityCard__avatar"
                                        />
                                    </Link>
                                ) : undefined
                            }
                            title={
                                <Link to={`/jobs/${job.id}`} className="SplashEntityCard__itemLink">
                                    {job.title}
                                </Link>
                            }
                        />
                            <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                {employmentType && <Tag>{employmentType}</Tag>}
                                {salary && <Tag color="gold">{salary}</Tag>}
                            </Space>
                        </SplashCardItem>
                    );
                }}
        />
    );
};
