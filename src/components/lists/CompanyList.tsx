import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Space, Typography } from "antd";
import { useListCompaniesQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityAccessTags } from "../shared/IdentityAccessTags";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { UsergroupAddOutlined } from "@ant-design/icons";

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
            title="Companies"
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (company) => (
                    <Space size={[8, 8]} wrap>
                        {company.name}
                        {company.identity?.name && (
                            <IdentityTagLink
                                identity={company.identity}
                                color="success"
                                icon={<UsergroupAddOutlined />}
                            />
                        )}
                    </Space>
                ),
                actions: (company) => <Link to={`/companies/${company.id}`}>Details</Link>,
                avatar: (company) => company.image?.url ? <Avatar src={`${BACKEND_URL}${company.image.url}`} /> : undefined,
                description: (company) => <Markdown className="Markdown--clamp2 EntityList__description">{company.description}</Markdown>,
                body: (company) => {
                    return  (
                        <Space direction="vertical" size={8} className="EntityList__body">
                            <CompanyContactLinks
                                website={company.website}
                                email={company.email}
                                phone={company.phone}
                                emptyText={<Typography.Text type="secondary">No contacts found</Typography.Text>}
                            />
                            <IdentityAccessTags
                                allowedIdentities={company.allowedIdentities}
                                disallowedIdentities={company.disallowedIdentities}
                                keyPrefix={company.id}
                            />
                        </Space>
                    );
                },
            }}
        />
    );
};
