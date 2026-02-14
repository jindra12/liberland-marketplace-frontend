import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Divider, Flex, Space, Tag, Typography } from "antd";
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    HomeFilled,
    GiftOutlined,
    TeamOutlined,
    InfoCircleOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import { useListJobsQuery } from "../../generated/graphql";
import { ApplyButton } from "../ApplyButton";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { timeAgo, formatSalary, formatEmploymentType, formatBounty, formatPositions } from "../../utils";
import { Markdown } from "../Markdown";

export interface JobListProps {
    limited?: boolean;
}

export const JobList: React.FunctionComponent<JobListProps> = (props) => {
    const [page, setPage] = React.useState(0);
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>([]);
    const query = useListJobsQuery({
        limit: 10,
        page,
    });
    const allItems = query.data?.Jobs?.docs || [];
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((job) => {
            const identityIds = [
                ...(job.allowedIdentities?.map((i) => i.id) || []),
                ...(job.company?.allowedIdentities?.map((i) => i.id) || []),
                ...(job.company ? [job.company.identity.id] : []),
            ];
            return selectedIdentityIds.some((id) => identityIds.includes(id));
        });

    return (
        <AppList
            hasMore={!props.limited && (!query.data?.Jobs || query.data.Jobs.hasNextPage)}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (job) => (
                    <Flex justify="space-between" align="center" wrap>
                        {job.title}
                        {job.company?.identity.name && <Tag color="success" icon={<UsergroupAddOutlined />}>{job.company?.identity.name}</Tag>}
                    </Flex>
                ),
                avatar: (job) => {
                    const url = job.image?.url || job.company?.image?.url;
                    return url ? (
                        <Avatar
                            shape="circle"
                            size={56}
                            src={`${BACKEND_URL}${url}`}
                            alt={job.title || ""}
                        />
                    ) : undefined;
                },
                body: (job) => {
                    const salary = formatSalary(
                        job.salaryRange?.min,
                        job.salaryRange?.max,
                        job.salaryRange?.currency
                    );
                    const bounty = formatBounty(job.bounty?.amount, job.bounty?.currency);
                    const positions = formatPositions(job.positions);
                    const isInactive = job.isActive === false;
                    return (
                        <Space direction="vertical" size={4}>
                            <Divider />
                            <Space size={[8, 4]} wrap>
                                {job.company?.name && (
                                    <Typography.Text strong>
                                        <HomeFilled />
                                        {job.company.name}
                                    </Typography.Text>
                                )}
                                {job.location && (
                                    <Typography.Text type="secondary">
                                        <EnvironmentOutlined /> {job.location}
                                    </Typography.Text>
                                )}
                                {formatEmploymentType(job.employmentType) && (
                                    <Tag color="blue">{formatEmploymentType(job.employmentType)}</Tag>
                                )}
                                {positions && (
                                    <Typography.Text type="secondary">
                                        <TeamOutlined /> {positions}
                                    </Typography.Text>
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
                            {bounty && (
                                <Typography.Text strong>
                                    <GiftOutlined /> Bounty: {bounty}
                                </Typography.Text>
                            )}
                            {isInactive && (
                                <Typography.Text type="secondary" className="JobInactiveNotice">
                                    <InfoCircleOutlined /> This job listing is no longer active.
                                </Typography.Text>
                            )}
                            <Divider />
                        </Space>
                    );
                },
                description: (job) => (
                    <div className="JobList__description">
                        <Markdown className="Markdown--clamp2">{job.description}</Markdown>
                    </div>
                ),
                actions: (job) => (
                    <Flex wrap gap="32px" align="center">
                        <Link to={`/jobs/${job.id}`}><Button size="large" className="ActionBtn">Details</Button></Link>
                        <ApplyButton url={job.applyUrl} />
                    </Flex>
                ),
            }}
        />
    );
};
