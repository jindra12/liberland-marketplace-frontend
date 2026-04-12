import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex } from "antd";

import { useListCompaniesQuery, useSearchCompaniesQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchCompanies } from "./utils";

export interface CompaniesSearchProps {
    onClose: () => void;
}

export const CompaniesSearch: React.FunctionComponent<CompaniesSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const defaultCompanies = useListCompaniesQuery({
        limit: 5,
        page: 1,
    });
    const searchedCompanies = useSearchCompaniesQuery(
        {
            searchTerm: submittedSearchValue,
            limit: 5,
            page: 1,
        },
        {
            enabled: submittedSearchValue.length > 0,
        },
    );
    const items =
        submittedSearchValue.length > 0
            ? mapSearchCompanies(searchedCompanies.data?.Searches?.docs)
            : defaultCompanies.data?.Companies?.docs ?? [];
    const loading = submittedSearchValue.length > 0 ? searchedCompanies.isLoading : defaultCompanies.isLoading;

    return (
        <SearchDrawer
            title="Company search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
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
                refetch={submittedSearchValue.length > 0 ? searchedCompanies.refetch : defaultCompanies.refetch}
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
