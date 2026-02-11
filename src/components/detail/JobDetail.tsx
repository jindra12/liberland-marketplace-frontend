import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, Button, Space, Tag, Typography } from "antd";
import SanitizedHTML from "react-sanitized-html";
import { ApplyButton } from "../ApplyButton";
import { ArrowLeftOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { useJobByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { timeAgo, formatSalary, formatEmploymentType, LOREM_FALLBACK } from "../../utils";

const JobDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useJobByIdQuery({ id: id! });
    return (
        <Loader query={query}>
            {(data) => {
                const job = data.Job;
                const salary = formatSalary(
                    job?.salaryRange?.min,
                    job?.salaryRange?.max,
                    job?.salaryRange?.currency
                );
                const empType = formatEmploymentType(job?.employmentType);

                return (
                    <div style={{ maxWidth: 800, margin: "0 auto" }}>
                        <Link to="/jobs">
                            <Button type="text" size="large" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16, fontSize: 18 }}>
                                Back to Jobs
                            </Button>
                        </Link>
                        <Space size={16} align="start" style={{ marginBottom: 16 }}>
                            {job?.image?.url && <Avatar shape="square" size={192} src={`${BACKEND_URL}${job.image.url}`} />}
                            <div>
                                <Typography.Title level={1} style={{ marginBottom: 8 }}>
                                    <Space>
                                        {job?.title}
                                        {job?.company?.image?.url && (
                                            <Avatar size="small" src={`${BACKEND_URL}${job.company.image.url}`} />
                                        )}
                                        {job?.company?.image?.url && job?.image?.url && "🤝"}
                                        {job?.image?.url && (
                                            <Avatar size="small" src={`${BACKEND_URL}${job.image.url}`} />
                                        )}
                                    </Space>
                                </Typography.Title>
                                <Space size={[12, 8]} wrap>
                                    {job?.company?.name && (
                                        <Typography.Text strong>{job.company.name}</Typography.Text>
                                    )}
                                    {job?.location && (
                                        <Typography.Text type="secondary">
                                            <EnvironmentOutlined /> {job.location}
                                        </Typography.Text>
                                    )}
                                    {empType && <Tag color="blue">{empType}</Tag>}
                                    {salary && (
                                        <Typography.Text strong>
                                            <DollarOutlined /> {salary}
                                        </Typography.Text>
                                    )}
                                    {job?.postedAt && (
                                        <Typography.Text type="secondary">
                                            <ClockCircleOutlined /> {timeAgo(job.postedAt)}
                                        </Typography.Text>
                                    )}
                                    <ApplyButton url={job?.applyUrl} />
                                </Space>
                            </div>
                        </Space>

                        <SanitizedHTML html={job?.description || LOREM_FALLBACK} />

                        <ApplyButton url={job?.applyUrl} />
                    </div>
                );
            }}
        </Loader>
    );
};

export default JobDetail;
