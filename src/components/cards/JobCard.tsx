import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Grid, List, Space, Tag, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { ListJobsQuery } from "../../generated/graphql";
import { formatEmploymentType, formatSalary, getImage } from "../../utils";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type JobItem = NonNullable<NonNullable<ListJobsQuery["Jobs"]>["docs"]>[number];

type JobCardProps = {
    items: JobItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};

export const JobCard: React.FunctionComponent<JobCardProps> = ({
    items,
    loading,
    identityId,
    totalDocs,
}) => {
    const { md } = Grid.useBreakpoint();
    const navigate = useNavigate();
    const remaining = totalDocs !== undefined ? totalDocs - items.length : 0;
    return (
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
                locale={{ emptyText: "Coming soon!" }}
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
                            actions={md ? [(
                                <SplashShareDetailActionRow
                                    key={`job-actions-${job.id}`}
                                    detailPath={`/jobs/${job.id}`}
                                    title={job.title || "Job"}
                                    text={`Check out ${job.title} on NSwap.`}
                                    onDetailsClick={() => navigate(`/jobs/${job.id}`)}
                                />
                            )] : undefined}
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
                                {!md && (
                                    <SplashShareDetailActionRow
                                        detailPath={`/jobs/${job.id}`}
                                        title={job.title || "Job"}
                                        text={`Check out ${job.title} on NSwap.`}
                                        onDetailsClick={() => navigate(`/jobs/${job.id}`)}
                                    />
                                )}
                            </div>
                        </List.Item>
                    );
                }}
            />
            {remaining > 0 && identityId && (
                <Link to={`/jobs?tribe=${identityId}`} className="SplashEntityCard__moreLink">
                    <Button type="link" icon={<RightOutlined />} iconPosition="end">
                        And +{remaining} more
                    </Button>
                </Link>
            )}
        </Card>
    );
};
