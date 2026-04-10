import * as React from "react";

import { Link } from "react-router-dom";

import { UseQueryResult } from "@tanstack/react-query";

import { UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Flex, Grid } from "antd";

import { ListCompaniesQuery } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useIdentityFilter } from "../../hooks/useIdentityFilter";
import { AppList } from "../AppList";
import { Markdown } from "../Markdown";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

export interface CompanyListInternalProps {
    query: UseQueryResult<ListCompaniesQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}

export const CompanyListInternal: React.FunctionComponent<CompanyListInternalProps> = (props) => {
    const { md } = Grid.useBreakpoint();
    const allItems = useAccumulatedDocs(props.query.data?.Companies?.docs, props.page);
    const { items, hasMore, endMessage, filterNode } = useIdentityFilter({
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
                        <Link to={`/companies/${company.id}`}>{company.name}</Link>
                        {company.identity?.name && (
                            <IdentityTagLink
                                identity={company.identity}
                                color="success"
                                icon={<UsergroupAddOutlined />}
                            />
                        )}
                    </Flex>
                ),
                actions: (company) =>
                    md ? (
                        <Flex justify="flex-end" gap="12px" wrap className="EntityList__actionsRow">
                            <ListShareDetailButtons
                                detailPath={`/companies/${company.id}`}
                                title={company.name}
                                text={`Check out ${company.name} on NSwap.`}
                                subscriptionTarget={{
                                    collection: "companies",
                                    targetID: company.id,
                                    serverURL: company.serverURL,
                                    isSubscribed: company.isSubscribed,
                                }}
                            />
                        </Flex>
                    ) : (
                        <Flex vertical gap="12px" className="EntityList__actionsRow CompanyList__actionsRow">
                            <ListShareDetailButtons
                                compact
                                detailPath={`/companies/${company.id}`}
                                title={company.name}
                                text={`Check out ${company.name} on NSwap.`}
                                subscriptionTarget={{
                                    collection: "companies",
                                    targetID: company.id,
                                    serverURL: company.serverURL,
                                    isSubscribed: company.isSubscribed,
                                }}
                            />
                        </Flex>
                    ),
                avatar: (company) =>
                    company.image?.url ? (
                        <Link to={`/companies/${company.id}`}>
                            <Avatar shape="square" size={80} src={getImage(company)} className="EntityList__avatar" />
                        </Link>
                    ) : undefined,
                body: (company) => (
                    <div className="EntityList__body CompanyList__body">
                        <CompanyContactLinks
                            website={company.website}
                            email={company.email}
                            phone={company.phone}
                            variant="compact"
                            className="CompanyList__contacts"
                        />
                        <Markdown className="Markdown--clamp3 EntityList__description">{company.description}</Markdown>
                    </div>
                ),
            }}
        />
    );
};
