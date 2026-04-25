import * as React from "react";

import { Link } from "react-router-dom";

import { UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Space, Tag } from "antd";

import { Job, ListJobsQuery } from "../../generated/graphql";
import { routes } from "../../routes";
import { useDislikeJobMutation, useLikeJobMutation } from "../hooks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";
import { formatEmploymentType, formatSalary } from "../shared/job/utils";

import { SplashCard } from "./SplashCard";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type JobItem = NonNullable<NonNullable<ListJobsQuery["Jobs"]>["docs"]>[number];
type JobCardProps = {
    items: JobItem[];
    loading?: boolean;
};

export const JobCard: React.FunctionComponent<JobCardProps> = (props) => {
    const likeMutation = useLikeJobMutation();
    const dislikeMutation = useDislikeJobMutation();

    return (
        <SplashCard
            className="SplashEntityCard--jobs"
            items={props.items}
            loading={props.loading}
            renderItem={(job) => {
                const employmentType = formatEmploymentType(job.employmentType);
                const salary = formatSalary(job.salaryRange?.min, job.salaryRange?.max, job.salaryRange?.currency);
                const imageSrc = getImage(job) || getImage(job.company);
                const detailPath = routes.jobs.detail.getLink(job as Job);

                return (
                    <SplashCardItem
                        id={job.id}
                        detailPath={detailPath}
                        title={job.title || "Job"}
                        avatar={
                            imageSrc ? (
                                <Link to={detailPath}>
                                    <Avatar
                                        shape="square"
                                        size={80}
                                        src={imageSrc}
                                        className="SplashEntityCard__avatar"
                                    />
                                </Link>
                            ) : null
                        }
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
                                detailPath={detailPath}
                                title={job.title || "Job"}
                                text={`Check out ${job.title} on NSwap.`}
                            />,
                        ]}
                    >
                        {job.company?.identity && (
                            <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                <IdentityTagLink
                                    identity={job.company.identity}
                                    color="success"
                                    icon={<UsergroupAddOutlined />}
                                />
                            </Space>
                        )}
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
