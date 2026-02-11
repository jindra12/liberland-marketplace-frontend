import * as React from "react";
import { useParams } from "react-router-dom";
import { Avatar, Button, Descriptions, Space, Tag, Typography } from "antd";
import { EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { useJobByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { timeAgo, formatSalary, formatEmploymentType } from "../../utils";

const LOREM_FALLBACK = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.\n\nTotam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.";

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
                    <>
                        {job?.image?.url && <Avatar size={96} src={`${BACKEND_URL}${job.image.url}`} />}
                        <Typography.Title level={1}>{job?.title}</Typography.Title>

                        <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
                            {job?.company?.name && (
                                <Descriptions.Item label="Company">{job.company.name}</Descriptions.Item>
                            )}
                            {job?.location && (
                                <Descriptions.Item label="Location">
                                    <EnvironmentOutlined /> {job.location}
                                </Descriptions.Item>
                            )}
                            {empType && (
                                <Descriptions.Item label="Employment Type">
                                    <Tag color="blue">{empType}</Tag>
                                </Descriptions.Item>
                            )}
                            {salary && (
                                <Descriptions.Item label="Salary">
                                    <DollarOutlined /> {salary}
                                </Descriptions.Item>
                            )}
                            {job?.postedAt && (
                                <Descriptions.Item label="Posted">
                                    <ClockCircleOutlined /> {timeAgo(job.postedAt)}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {job?.applyUrl && (
                            <Space style={{ marginBottom: 16 }}>
                                <Button type="primary" href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                                    Apply
                                </Button>
                            </Space>
                        )}

                        <Typography.Paragraph>{job?.description || LOREM_FALLBACK}</Typography.Paragraph>
                    </>
                );
            }}
        </Loader>
    );
};

export default JobDetail;
