import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Avatar, Button, Divider, Flex, Typography } from "antd";
import { UsergroupAddOutlined } from "@ant-design/icons";
import { UseQueryResult } from "@tanstack/react-query";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { ListCompaniesQuery } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";

export interface CompanyListInternalProps {
    query: UseQueryResult<ListCompaniesQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}


export const CompanyListInternal: React.FunctionComponent<CompanyListInternalProps> = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tribeParam = searchParams.get("tribe");
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>(
        tribeParam ? [tribeParam] : []
    );
    const allItems = useAccumulatedDocs(props.query.data?.Companies?.docs, props.page);
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((company) => {
            const identityIds = [
                ...(company.allowedIdentities?.map((i) => i.id) || []),
                ...(company.identity?.id ? [company.identity.id] : []),
            ];
            return selectedIdentityIds.some((id) => identityIds.includes(id));
        });

    const hasMore = Boolean(props.query.data?.Companies?.hasNextPage);
    const isTribeFiltered = selectedIdentityIds.length > 0;

    // Auto-fetch next page when tribe filter yields 0 visible items but more pages exist
    React.useEffect(() => {
        if (isTribeFiltered && items.length === 0 && hasMore && !props.query.isLoading && !props.query.isFetching) {
            props.setPage(props.page + 1);
        }
    }, [isTribeFiltered, items.length, hasMore, props.query.isLoading, props.query.isFetching, props.page, props.setPage]);

    const tribeEndMessage = isTribeFiltered && !hasMore ? (
        <div className="AppList__tribeEnd">
            <Divider />
            <Typography.Title level={4} className="AppList__tribeEndHeading">
                No more results for this Tribe
            </Typography.Title>
            <Button
                type="primary"
                size="large"
                href={window.location.pathname}
            >
                View items from all tribes
            </Button>
        </div>
    ) : undefined;

    return (
        <AppList
            hasMore={hasMore}
            items={items}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            loading={props.query.isLoading && allItems.length === 0}
            title="Companies"
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            endMessage={tribeEndMessage}
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
