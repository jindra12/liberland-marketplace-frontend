import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex } from "antd";

import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useListIdentitiesQuery, useSearchIdentitiesQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { getImage } from "../shared/image/utils";

import { SEARCH_DRAWER_SCROLLABLE_ID } from "./constants";
import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchIdentities } from "./utils";

export interface IdentitiesSearchProps {
    onClose: () => void;
}

export const IdentitiesSearch: React.FunctionComponent<IdentitiesSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const [page, setPage] = React.useState(1);
    const defaultIdentities = useListIdentitiesQuery({
        limit: 5,
        page: 1,
    });
    const searchedIdentities = useSearchIdentitiesQuery(
        {
            searchTerm: submittedSearchValue,
            limit: 5,
            page,
        },
        {
            enabled: submittedSearchValue.length > 0,
        },
    );
    const searchDocs = useAccumulatedDocs(searchedIdentities.data?.Searches?.docs, page);
    const items =
        submittedSearchValue.length > 0
            ? mapSearchIdentities(searchDocs)
            : defaultIdentities.data?.Identities?.docs ?? [];
    const loading =
        submittedSearchValue.length > 0
            ? searchedIdentities.isLoading && searchDocs.length === 0
            : defaultIdentities.isLoading;
    const hasMore = submittedSearchValue.length > 0 ? Boolean(searchedIdentities.data?.Searches?.hasNextPage) : false;

    return (
        <SearchDrawer
            title="Tribe search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
                setPage(1);
            }}
            placeholder="Search tribes"
        >
            <SearchResultsList
                title={
                    submittedSearchValue.length > 0
                        ? `Search results for "${submittedSearchValue}"`
                        : "Tribes"
                }
                items={items}
                loading={loading}
                hasMore={hasMore}
                next={() => {
                    setPage((currentPage) => currentPage + 1);
                }}
                refetch={submittedSearchValue.length > 0 ? searchedIdentities.refetch : defaultIdentities.refetch}
                scrollableTarget={SEARCH_DRAWER_SCROLLABLE_ID}
                emptyText="No matching tribes"
                renderItem={{
                    title: (identity) => (
                        <Flex align="center" gap={12}>
                            <Link to={`/tribes/${identity.id}`} onClick={props.onClose}>
                                {identity.name}
                            </Link>
                        </Flex>
                    ),
                    avatar: (identity) =>
                        identity.image?.url ? (
                            <Link to={`/tribes/${identity.id}`} onClick={props.onClose}>
                                <Avatar src={getImage(identity)} size={88} />
                            </Link>
                        ) : undefined,
                    description: (identity) => (
                        <Markdown className="Markdown--clamp2 EntityList__description">{identity.description}</Markdown>
                    ),
                }}
            />
        </SearchDrawer>
    );
};
