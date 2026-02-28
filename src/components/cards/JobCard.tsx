import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, List, Space, Tag, Typography } from "antd";
import { ListJobsQuery } from "../../generated/graphql";
import { formatEmploymentType, formatSalary, getImage } from "../../utils";

type JobItem = NonNullable<NonNullable<ListJobsQuery["Jobs"]>["docs"]>[number];

type JobCardProps = {
    items: JobItem[];
    loading?: boolean;
};

export const JobCard: React.FunctionComponent<JobCardProps> = ({
    items,
    loading,
}) => (
    <Card
        className="SplashEntityCard SplashEntityCard--jobs"
        title={(
            <Typography.Title level={3} className="SplashEntityCard__title">
                <Link to="/jobs" className="SplashEntityCard__titleLink">Jobs</Link>
            </Typography.Title>
        )}
    >
        <List
            className="SplashEntityCard__list"
            loading={loading}
            dataSource={items}
            locale={{ emptyText: "No jobs for this tribe" }}
            renderItem={(job) => {
                const employmentType = formatEmploymentType(job.employmentType);
                const salary = formatSalary(
                    job.salaryRange?.min,
                    job.salaryRange?.max,
                    job.salaryRange?.currency
                );
                const imageSrc = getImage(job) || getImage(job.company);
                return (
                    <List.Item
                        actions={[
                            (
                                <Link key={`job-link-${job.id}`} to={`/jobs/${job.id}`}>
                                    <Button>Details</Button>
                                </Link>
                            ),
                        ]}
                    >
                        <div className="SplashEntityCard__itemBody">
                            <List.Item.Meta
                                avatar={imageSrc ? (
                                    <Link to={`/jobs/${job.id}`}>
                                        <Avatar
                                            shape="square"
                                            size={48}
                                            src={imageSrc}
                                            className="SplashEntityCard__avatar"
                                        />
                                    </Link>
                                ) : undefined}
                                title={(
                                    <Link to={`/jobs/${job.id}`} className="SplashEntityCard__itemLink">
                                        {job.title}
                                    </Link>
                                )}
                            />
                            <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                {employmentType && <Tag>{employmentType}</Tag>}
                                {salary && <Tag color="gold">{salary}</Tag>}
                            </Space>
                        </div>
                    </List.Item>
                );
            }}
        />
    </Card>
);
