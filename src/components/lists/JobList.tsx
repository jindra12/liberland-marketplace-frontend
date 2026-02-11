import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Space, Tag, Typography } from "antd";
import { EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { useListJobsQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { BACKEND_URL } from "../../gqlFetcher";
import { timeAgo, formatSalary, formatEmploymentType } from "../../utils";

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
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
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
                    return url ? <Avatar shape="square" size={80} src={`${BACKEND_URL}${url}`} /> : undefined;
                },
                description: (job) => (
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
                ),
                body: (job) => {
                    const salary = formatSalary(
                        job.salaryRange?.min,
                        job.salaryRange?.max,
                        job.salaryRange?.currency
                    );
                    return (
                        <Space direction="vertical" size={4}>
                            {salary && (
                                <Typography.Text strong>
                                    <DollarOutlined /> {salary}
                                </Typography.Text>
                            )}
                            <Typography.Paragraph
                                type="secondary"
                                ellipsis={{ rows: 2 }}
                                style={{ marginBottom: 0 }}
                            >
                                {job.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.\n\nTotam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."}
                            </Typography.Paragraph>
                        </Space>
                    );
                },
                actions: (job) => (
                    <Space>
                        <Link to={`/jobs/${job.id}`}><Button size="large" style={{ minWidth: 120 }}>Details</Button></Link>
                        {job.applyUrl && (
                            <Button type="primary" size="large" style={{ minWidth: 120 }} href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                                Apply
                            </Button>
                        )}
                    </Space>
                ),
            }}
        />
        </div>
    );
};
