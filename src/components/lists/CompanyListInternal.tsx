import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex } from "antd";
import { UsergroupAddOutlined } from "@ant-design/icons";
import { UseQueryResult } from "@tanstack/react-query";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { ListCompaniesQuery } from "../../generated/graphql";

export interface CompanyListInternalProps {
    query: UseQueryResult<ListCompaniesQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}


export const CompanyListInternal: React.FunctionComponent<CompanyListInternalProps> = (props) => {
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>([]);
    const allItems = props.query.data?.Companies?.docs || [];
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((company) => {
            const identityIds = [
                ...(company.allowedIdentities?.map((i) => i.id) || []),
                company.identity?.id,
            ];
            return selectedIdentityIds.some((id) => identityIds.includes(id));
        });

    return (
        <AppList
            hasMore={!props.query.data?.Companies || props.query.data.Companies.hasNextPage}
            items={items}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            title="Companies"
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (company) => (
                    <Flex justify="space-between" align="center" wrap>
                        {company.name}
                        {company.identity?.name && (
                            <IdentityTagLink
                                identity={company.identity}
                                color="success"
                                icon={<UsergroupAddOutlined />}
                            />
                        )}
                    </Flex>
                ),
                actions: (company) => <Link to={`/companies/${company.id}`}><Button type="primary" variant="filled" className="ActionBtn" size="large">Details</Button></Link>,
                avatar: (company) => company.image?.url ? (
                    <Avatar
                        shape="square"
                        size={80}
                        src={`${BACKEND_URL}${company.image.url}`}
                        className="EntityList__avatar"
                    />
                ) : undefined,
                description: (company) => (
                    <CompanyContactLinks
                        website={company.website}
                        email={company.email}
                        phone={company.phone}
                    />
                ),
                body: (company) => <Markdown className="Markdown--clamp3 EntityList__description">{company.description}</Markdown>,
            }}
        />
    );
};
