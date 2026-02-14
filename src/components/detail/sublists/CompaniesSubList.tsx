import * as React from "react";
import { Link } from "react-router-dom";
import { List, Space, Tag, Typography } from "antd";
import {
    GlobalOutlined,
    MailOutlined,
    MinusCircleFilled,
    PhoneOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import uniqBy from "lodash-es/uniqBy";
import { Markdown } from "../../Markdown";

interface IdentitySummary {
    id: string;
    name: string;
}

export interface CompaniesSubListItem {
    id: string;
    name: string;
    description?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    identity?: IdentitySummary | null;
    allowedIdentities?: IdentitySummary[] | null;
    disallowedIdentities?: IdentitySummary[] | null;
}

export interface CompaniesSubListProps {
    title: string;
    companies: CompaniesSubListItem[];
    emptyText: string;
}

export const CompaniesSubList: React.FunctionComponent<CompaniesSubListProps> = (props) => {
    return (
        <div className="EntitySubList">
            <Typography.Title level={4} className="EntitySubList__title">
                {props.title}
            </Typography.Title>
            <List
                dataSource={props.companies}
                locale={{ emptyText: props.emptyText }}
                itemLayout="vertical"
                renderItem={(company) => {
                    const allowedIdentities = uniqBy(company.allowedIdentities || [], "id");
                    const disallowedIdentities = uniqBy(company.disallowedIdentities || [], "id");

                    return (
                        <List.Item key={company.id}>
                            <Typography.Text strong className="EntitySubList__itemTitle">
                                <Link to={`/companies/${company.id}`}>{company.name}</Link>
                            </Typography.Text>
                            <Space size={[8, 8]} wrap className="EntitySubList__meta">
                                {company.identity?.name && (
                                    <Link to={`/identities/${company.identity.id}`}>
                                        <Tag color="success" icon={<UsergroupAddOutlined />}>
                                            {company.identity.name}
                                        </Tag>
                                    </Link>
                                )}
                                {company.website && (
                                    <Typography.Link href={company.website} target="_blank" rel="noreferrer">
                                        <GlobalOutlined /> {company.website}
                                    </Typography.Link>
                                )}
                                {company.email && (
                                    <Typography.Link href={`mailto:${company.email}`}>
                                        <MailOutlined /> {company.email}
                                    </Typography.Link>
                                )}
                                {company.phone && (
                                    <Typography.Link href={`tel:${company.phone}`}>
                                        <PhoneOutlined /> {company.phone}
                                    </Typography.Link>
                                )}
                            </Space>
                            <Markdown className="Markdown--clamp2 EntitySubList__description">
                                {company.description}
                            </Markdown>
                            {Boolean(allowedIdentities.length || disallowedIdentities.length) && (
                                <Space size={[8, 8]} wrap className="EntitySubList__identities">
                                    {allowedIdentities.map((identity) => (
                                        <Link key={`allowed-${company.id}-${identity.id}`} to={`/identities/${identity.id}`}>
                                            <Tag color="success" icon={<UsergroupAddOutlined />}>
                                                {identity.name}
                                            </Tag>
                                        </Link>
                                    ))}
                                    {disallowedIdentities.map((identity) => (
                                        <Link key={`disallowed-${company.id}-${identity.id}`} to={`/identities/${identity.id}`}>
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
