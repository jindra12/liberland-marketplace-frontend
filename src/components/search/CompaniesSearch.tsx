import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex } from "antd";

import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useListCompaniesQuery, useSearchCompaniesQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

import { SEARCH_DRAWER_SCROLLABLE_ID } from "./constants";
import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchCompanies } from "./utils";

export interface CompaniesSearchProps {
    onClose: () => void;
}

export const CompaniesSearch: React.FunctionComponent<CompaniesSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const [page, setPage] = React.useState(1);
    const defaultCompanies = useListCompaniesQuery({
        limit: 5,
        page: 1,
    });
    const searchedCompanies = useSearchCompaniesQuery(
        {
            searchTerm: submittedSearchValue,
            limit: 5,
            page,
        },
        {
            enabled: submittedSearchValue.length > 0,
        },
    );
    const searchDocs = useAccumulatedDocs(searchedCompanies.data?.Searches?.docs, page);
    const items =
        submittedSearchValue.length > 0
            ? mapSearchCompanies(searchDocs)
            : defaultCompanies.data?.Companies?.docs ?? [];
    const loading =
        submittedSearchValue.length > 0
            ? searchedCompanies.isLoading && searchDocs.length === 0
            : defaultCompanies.isLoading;
    const hasMore = submittedSearchValue.length > 0 ? Boolean(searchedCompanies.data?.Searches?.hasNextPage) : false;

    return (
        <SearchDrawer
            title="Company search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
                setPage(1);
            }}
            placeholder="Search companies"
        >
            <SearchResultsList
                title={
                    submittedSearchValue.length > 0
                        ? `Search results for "${submittedSearchValue}"`
                        : "Companies"
                }
                items={items}
                loading={loading}
                hasMore={hasMore}
                next={() => {
                    setPage((currentPage) => currentPage + 1);
                }}
                refetch={submittedSearchValue.length > 0 ? searchedCompanies.refetch : defaultCompanies.refetch}
                scrollableTarget={SEARCH_DRAWER_SCROLLABLE_ID}
                emptyText="No matching companies"
                renderItem={{
                    title: (company) => (
                        <Flex justify="space-between" align="center" wrap>
                            <Link to={`/companies/${company.id}`} onClick={props.onClose}>
                                {company.name}
                            </Link>
                            {company.identity?.name && (
                                <IdentityTagLink identity={company.identity} color="success" />
                            )}
                        </Flex>
                    ),
                    avatar: (company) =>
                        company.image?.url ? (
                            <Link to={`/companies/${company.id}`} onClick={props.onClose}>
                                <Avatar
                                    shape="square"
                                    size={80}
                                    src={getImage(company)}
                                    className="EntityList__avatar"
                                />
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
        </SearchDrawer>
    );
};
