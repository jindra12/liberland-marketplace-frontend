import * as React from "react";
import { Link } from "react-router-dom";
import { List, Space, Tag, Typography } from "antd";
import {
    HomeFilled,
    GiftOutlined,
    TeamOutlined,
    MinusCircleFilled,
    UsergroupAddOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import uniqBy from "lodash-es/uniqBy";
import { Job_Bounty_Currency } from "../../../generated/graphql";
import { formatBounty, formatPositions } from "../../../utils";
import { Markdown } from "../../Markdown";

interface IdentitySummary {
    id: string;
    name: string;
}

interface CompanySummary {
    id: string;
    name: string;
    identity?: IdentitySummary | null;
    allowedIdentities?: IdentitySummary[] | null;
    disallowedIdentities?: IdentitySummary[] | null;
}

export interface JobsSubListItem {
    id: string;
    title?: string | null;
    description?: string | null;
    positions?: number | null;
    isActive?: boolean | null;
    bounty?: {
        amount?: number | null;
        currency?: Job_Bounty_Currency | null;
    } | null;
    allowedIdentities?: IdentitySummary[] | null;
    disallowedIdentities?: IdentitySummary[] | null;
    company?: CompanySummary | null;
}

export interface JobsSubListProps {
    title: string;
    jobs: JobsSubListItem[];
    emptyText: string;
    showCompany?: boolean;
}

export const JobsSubList: React.FunctionComponent<JobsSubListProps> = (props) => {
    return (
        <div className="EntitySubList">
            <Typography.Title level={4} className="EntitySubList__title">
                {props.title}
            </Typography.Title>
            <List
                dataSource={props.jobs}
                locale={{ emptyText: props.emptyText }}
                itemLayout="vertical"
                renderItem={(job) => {
                    const isInactive = job.isActive === false;
                    const bounty = formatBounty(job.bounty?.amount, job.bounty?.currency);
                    const positions = formatPositions(job.positions);
                    const allowedIdentities = uniqBy(
                        [...(job.allowedIdentities || []), ...(job.company?.allowedIdentities || [])],
                        "id"
                    );
                    const disallowedIdentities = uniqBy(
                        [...(job.disallowedIdentities || []), ...(job.company?.disallowedIdentities || [])],
                        "id"
                    );

                    return (
                        <List.Item key={job.id}>
                            <Typography.Text strong className="EntitySubList__itemTitle" delete={isInactive}>
                                <Link to={`/jobs/${job.id}`}>{job.title || "Untitled job"}</Link>
                            </Typography.Text>
                            <Space size={[8, 8]} wrap className="EntitySubList__meta">
                                {props.showCompany && job.company?.name && (
                                    <Tag icon={<HomeFilled />}>{job.company.name}</Tag>
                                )}
                                {job.company?.identity?.name && (
                                    <Link to={`/identities/${job.company.identity.id}`}>
                                        <Tag color="success" icon={<UsergroupAddOutlined />}>
                                            {job.company.identity.name}
                                        </Tag>
                                    </Link>
                                )}
                                {positions && (
                                    <Tag icon={<TeamOutlined />}>
                                        {positions}
                                    </Tag>
                                )}
                                {bounty && (
                                    <Tag icon={<GiftOutlined />} color="gold">
                                        Bounty: {bounty}
                                    </Tag>
                                )}
                                {isInactive && (
                                    <Tag icon={<InfoCircleOutlined />}>
                                        Inactive
                                    </Tag>
                                )}
                            </Space>
                            <Markdown className="Markdown--clamp2 EntitySubList__description">
                                {job.description}
                            </Markdown>
                            {Boolean(allowedIdentities.length || disallowedIdentities.length) && (
                                <Space size={[8, 8]} wrap className="EntitySubList__identities">
                                    {allowedIdentities.map((identity) => (
                                        <Link key={`allowed-${job.id}-${identity.id}`} to={`/identities/${identity.id}`}>
                                            <Tag color="success" icon={<UsergroupAddOutlined />}>
                                                {identity.name}
                                            </Tag>
                                        </Link>
                                    ))}
                                    {disallowedIdentities.map((identity) => (
                                        <Link key={`disallowed-${job.id}-${identity.id}`} to={`/identities/${identity.id}`}>
                                            <Tag color="error" icon={<MinusCircleFilled />}>
                                                {identity.name}
                                            </Tag>
                                        </Link>
                                    ))}
                                </Space>
                            )}
                        </List.Item>
                    );
                }}
            />
        </div>
    );
};
