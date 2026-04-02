import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Card, Grid, List, Space, Tag, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { ListJobsQuery } from "../../generated/graphql";
import { formatEmploymentType, formatSalary, getImage } from "../../utils";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";
import { RouteButton } from "../RouteButton";
type JobItem = NonNullable<NonNullable<ListJobsQuery["Jobs"]>["docs"]>[number];
type JobCardProps = {
    items: JobItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};
export const JobCard: React.FunctionComponent<JobCardProps> = (props) => {
    const { xl } = Grid.useBreakpoint();
    const remaining = props.totalDocs !== undefined ? props.totalDocs - props.items.length : 0;
    return (
        <Card
            className="SplashEntityCard SplashEntityCard--jobs"
            title={
                <Typography.Title level={3} className="SplashEntityCard__title">
                    <Link to="/jobs" className="SplashEntityCard__titleLink">
                        Jobs
                    </Link>
                </Typography.Title>
            }
        >
            <List
                className="SplashEntityCard__list"
                loading={props.loading}
                dataSource={props.items}
                locale={{
                    emptyText: "Coming soon!",
                }}
                renderItem={(job) => {
                    const employmentType = formatEmploymentType(job.employmentType);
                    const salary = formatSalary(job.salaryRange?.min, job.salaryRange?.max, job.salaryRange?.currency);
                    const imageSrc = getImage(job) || getImage(job.company);
                    return (
                        <List.Item
                            actions={
                                xl
                                    ? [<SplashShareDetailActionRow key={`job-actions-${job.id}`} detailPath={`/jobs/${job.id}`} title={job.title || "Job"} text={`Check out ${job.title} on NSwap.`} />]
                                    : undefined
                            }
                        >
                            <div className="SplashEntityCard__itemBody">
                                <List.Item.Meta
                                    avatar={
                                        imageSrc ? (
                                            <Link to={`/jobs/${job.id}`}>
                                                <Avatar shape="square" size={48} src={imageSrc} className="SplashEntityCard__avatar" />
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
                                {!xl && <SplashShareDetailActionRow detailPath={`/jobs/${job.id}`} title={job.title || "Job"} text={`Check out ${job.title} on NSwap.`} />}
                            </div>
                        </List.Item>
                    );
                }}
            />
            {remaining > 0 && props.identityId && (
                <RouteButton to={`/jobs?tribe=${props.identityId}`} type="link" icon={<RightOutlined />} iconPosition="end" className="SplashEntityCard__moreLink">
                    And +{remaining} more
                </RouteButton>
            )}
        </Card>
    );
};
