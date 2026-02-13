import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Space, Tag, Typography } from "antd";
import SanitizedHTML from "react-sanitized-html";
import { ApplyButton } from "../ApplyButton";
import { EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { useListJobsQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { BACKEND_URL } from "../../gqlFetcher";
import { timeAgo, formatSalary, formatEmploymentType, LOREM_FALLBACK } from "../../utils";

export interface JobListProps {
    limited?: boolean;
}

export const JobList: React.FunctionComponent<JobListProps> = (props) => {
    const [page, setPage] = React.useState(0);
    const query = useListJobsQuery({
        limit: 10,
        page,
    });
    const items = query.data?.Jobs?.docs || [];

    return (
        <div className="JobContainer">
        <AppList
            hasMore={!props.limited && (!query.data?.Jobs || query.data.Jobs.hasNextPage)}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            renderItem={{
                title: (job) => (
                    <Space>
                        {job.title}
                        {job.company?.image?.url && (
                            <Avatar size="small" src={`${BACKEND_URL}${job.company.image.url}`} />
                        )}
                        {job.company?.image?.url && job.image?.url && "🤝"}
                        {job.image?.url && (
                            <Avatar size="small" src={`${BACKEND_URL}${job.image.url}`} />
                        )}
                    </Space>
                ),
                avatar: (job) => {
                    const url = job.image?.url;
                    return url ? (
                        <img
                            src={`${BACKEND_URL}${url}`}
                            alt={job.title || ""}
                            className="JobList__avatar"
                        />
                    ) : undefined;
                },
                description: (job) => {
                    const salary = formatSalary(
                        job.salaryRange?.min,
                        job.salaryRange?.max,
                        job.salaryRange?.currency
                    );
                    return (
                        <Space direction="vertical" size={4}>
                            <Space size={[8, 4]} wrap>
                                {job.company?.name && (
                                    <Typography.Text strong>{job.company.name}</Typography.Text>
                                )}
                                {job.location && (
                                    <Typography.Text type="secondary">
                                        <EnvironmentOutlined /> {job.location}
                                    </Typography.Text>
                                )}
                                {formatEmploymentType(job.employmentType) && (
                                    <Tag color="blue">{formatEmploymentType(job.employmentType)}</Tag>
                                )}
                                {job.postedAt && (
                                    <Typography.Text type="secondary">
                                        <ClockCircleOutlined /> {timeAgo(job.postedAt)}
                                    </Typography.Text>
                                )}
                            </Space>
                            {salary && (
                                <Typography.Text strong>
                                    <DollarOutlined /> {salary}
                                </Typography.Text>
                            )}
                        </Space>
                    );
                },
                body: (job) => (
                    <div className="JobList__description">
                        <SanitizedHTML html={job.description || LOREM_FALLBACK} />
                    </div>
                ),
                actions: (job) => (
                    <Space>
                        <Link to={`/jobs/${job.id}`}><Button size="large" className="ActionBtn">Details</Button></Link>
                        <ApplyButton url={job.applyUrl} />
                    </Space>
                ),
            }}
        />
        </div>
    );
};
