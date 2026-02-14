import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Space, Tag, Typography } from "antd";
import {
    GlobalOutlined,
    MailOutlined,
    MinusCircleFilled,
    PhoneOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import { useListCompaniesQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";

export const CompanyList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>([]);
    const query = useListCompaniesQuery({
        limit: 10,
        page,
    });
    const allItems = query.data?.Companies?.docs || [];
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((company) => {
            const identityIds = [
                ...(company.allowedIdentities?.map((i) => i.id) || []),
                company.identity.id,
            ];
            return selectedIdentityIds.some((id) => identityIds.includes(id));
        });

    return (
        <AppList
            hasMore={!query.data?.Companies || query.data.Companies.hasNextPage}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (company) => (
                    <Space size={[8, 8]} wrap>
                        {company.name}
                        {company.identity?.name && (
                            <Link to={`/identities/${company.identity.id}`}>
                                <Tag color="success" icon={<UsergroupAddOutlined />}>
                                    {company.identity.name}
                                </Tag>
                            </Link>
                        )}
                    </Space>
                ),
                actions: (company) => <Link to={`/companies/${company.id}`}>Details</Link>,
                avatar: (company) => company.image?.url ? <Avatar src={`${BACKEND_URL}${company.image.url}`} /> : undefined,
                description: (company) => <Markdown className="Markdown--clamp2 EntityList__description">{company.description}</Markdown>,
                body: (company) => {
                    const contacts = [
                        company.website ? (
                            <Typography.Link key={`website-${company.id}`} href={company.website} target="_blank" rel="noreferrer">
                                <GlobalOutlined /> {company.website}
                            </Typography.Link>
                        ) : undefined,
                        company.email ? (
                            <Typography.Link key={`email-${company.id}`} href={`mailto:${company.email}`}>
                                <MailOutlined /> {company.email}
                            </Typography.Link>
                        ) : undefined,
                        company.phone ? (
                            <Typography.Link key={`phone-${company.id}`} href={`tel:${company.phone}`}>
                                <PhoneOutlined /> {company.phone}
                            </Typography.Link>
                        ) : undefined,
                    ].filter(Boolean);

                    return  (
                        <Space direction="vertical" size={8} className="EntityList__body">
                            {contacts.length ? (
                                <Space size={[8, 8]} wrap>{contacts}</Space>
                            ) : (
                                <Typography.Text type="secondary">No contacts found</Typography.Text>
                            )}
                            <Space size={[8, 8]} wrap>
                                {company.allowedIdentities?.map((identity) => (
                                    <Link key={`allowed-${company.id}-${identity.id}`} to={`/identities/${identity.id}`}>
                                        <Tag color="success" icon={<UsergroupAddOutlined />}>
                                            {identity.name}
                                        </Tag>
                                    </Link>
                                ))}
                                {company.disallowedIdentities?.map((identity) => (
                                    <Link key={`disallowed-${company.id}-${identity.id}`} to={`/identities/${identity.id}`}>
                                        <Tag color="error" icon={<MinusCircleFilled />}>
                                            {identity.name}
                                        </Tag>
                                    </Link>
                                ))}
                            </Space>
                        </Space>
                    );
                },
            }}
        />
    );
};
