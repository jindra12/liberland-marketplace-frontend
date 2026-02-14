import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Divider, Flex, Grid, Space, Tag, Typography } from "antd";
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    MinusCircleFilled,
    GiftOutlined,
    TeamOutlined,
    InfoCircleOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import uniqBy from "lodash-es/uniqBy";
import { useJobByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { timeAgo, formatSalary, formatEmploymentType, formatBounty, formatPositions } from "../../utils";
import { ApplyButton } from "../ApplyButton";
import { Markdown } from "../Markdown";

const JobDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { md } = Grid.useBreakpoint();
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
                const bounty = formatBounty(job?.bounty?.amount, job?.bounty?.currency);
                const positions = formatPositions(job?.positions);
                const empType = formatEmploymentType(job?.employmentType);
                const url = job?.image?.url || job?.company?.image?.url;
                const avatarSize = md ? 192 : 112;
                const isInactive = job?.isActive === false;
                const allowedIdentities = uniqBy([
                    ...job?.allowedIdentities || [],
                    ...job?.company?.allowedIdentities || [],
                ], identity => identity.name);
                const disallowedIdentities = uniqBy([
                    ...job?.allowedIdentities || [],
                    ...job?.company?.allowedIdentities || [],
                ], identity => identity.name);

                return (
                    <div>
                        <Space size={16} align="start" className="JobDetail__header">
                            {url && <Avatar shape="circle" size={avatarSize} src={`${BACKEND_URL}${url}`} />}
                            <div>
                                <Typography.Title level={1} className="JobDetail__title" delete={isInactive}>
                                    <Flex justify="space-between" align="center" gap="16px" wrap>
                                        {job?.title}
                                        {job?.company?.identity.name && (
                                            <Tag color="success" icon={<UsergroupAddOutlined />}>
                                                {job?.company?.identity.name}
                                            </Tag>
                                        )}
                                    </Flex>
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
                                    {bounty && (
                                        <Typography.Text strong>
                                            <GiftOutlined /> Bounty: {bounty}
                                        </Typography.Text>
                                    )}
                                    {positions && (
                                        <Typography.Text type="secondary">
                                            <TeamOutlined /> {positions}
                                        </Typography.Text>
                                    )}
                                    {job?.postedAt && (
                                        <Typography.Text type="secondary">
                                            <ClockCircleOutlined /> {timeAgo(job.postedAt)}
                                        </Typography.Text>
                                    )}
                                </Space>
                                {isInactive && (
                                    <Typography.Text type="secondary" className="JobInactiveNotice">
                                        <InfoCircleOutlined /> This job listing is no longer active.
                                    </Typography.Text>
                                )}
                            </div>
                        </Space>
                        <Divider />
                        <Flex gap="32px" vertical>
                            <Markdown>{job?.description}</Markdown>
                            <Flex wrap gap="16px" justify="center" align="center">
                                <Flex flex={5} vertical gap="16px">
                                    <Flex vertical gap="8px">
                                        <Flex gap="8px" align="center">
                                            <UsergroupAddOutlined />
                                            Allowed identities
                                        </Flex>
                                    </Flex>
                                    {allowedIdentities.length ? allowedIdentities.map((identity) => (
                                        <Link to={`/identity/${identity.id}`}>
                                            <Tag color="success">
                                                {identity.name}
                                            </Tag>
                                        </Link>
                                    )) : "No identities found"}
                                </Flex>
                                <Divider type="vertical" />
                                <Flex flex={5} vertical gap="16px">
                                    <Flex vertical gap="8px">
                                        <Flex gap="8px" align="center">
                                            <MinusCircleFilled />
                                            Disallowed identities
                                        </Flex>
                                    </Flex>
                                    {disallowedIdentities ? disallowedIdentities.map((identity) => (
                                        <Link to={`/identity/${identity.id}`}>
                                            <Tag color="error">
                                                {identity.name}
                                            </Tag>
                                        </Link>
                                    )) : "No identities found"}
                                </Flex>
                            </Flex>
                            <div>
                                <ApplyButton url={job?.applyUrl} />
                            </div>
                        </Flex>
                    </div>
                );
            }}
        </Loader>
    );
};

export default JobDetail;
