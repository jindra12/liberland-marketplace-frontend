import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex } from "antd";
import { UsergroupAddOutlined } from "@ant-design/icons";
import { UseQueryResult } from "@tanstack/react-query";
import { AppList } from "../AppList";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { ListCompaniesQuery } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useTribeFilter } from "../../hooks/useTribeFilter";

export interface CompanyListInternalProps {
    query: UseQueryResult<ListCompaniesQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}


export const CompanyListInternal: React.FunctionComponent<CompanyListInternalProps> = (props) => {
    const allItems = useAccumulatedDocs(props.query.data?.Companies?.docs, props.page);
    const { items, hasMore, endMessage, filterNode } = useTribeFilter({
        allItems,
        hasNextPage: Boolean(props.query.data?.Companies?.hasNextPage),
        getIdentityIds: (company) => [
            ...(company.allowedIdentities?.map((i) => i.id) || []),
            ...(company.identity?.id ? [company.identity.id] : []),
        ],
        isLoading: props.query.isLoading,
        isFetching: props.query.isFetching,
        page: props.page,
        setPage: props.setPage,
    });

    return (
        <AppList
            hasMore={hasMore}
            items={items}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            loading={props.query.isLoading && allItems.length === 0}
            title="Companies"
            filters={filterNode}
            endMessage={endMessage}
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
                    <Link to={`/companies/${company.id}`}>
                        <Avatar
                            shape="square"
                            size={80}
                            src={`${BACKEND_URL}${company.image.url}`}
                            className="EntityList__avatar"
                        />
                    </Link>
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
