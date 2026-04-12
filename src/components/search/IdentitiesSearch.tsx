import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex } from "antd";

import { useListIdentitiesQuery, useSearchIdentitiesQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { getImage } from "../shared/image/utils";

import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchIdentities } from "./utils";

export interface IdentitiesSearchProps {
    onClose: () => void;
}

export const IdentitiesSearch: React.FunctionComponent<IdentitiesSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const defaultIdentities = useListIdentitiesQuery({
        limit: 5,
        page: 1,
    });
    const searchedIdentities = useSearchIdentitiesQuery(
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
            ? mapSearchIdentities(searchedIdentities.data?.Searches?.docs)
            : defaultIdentities.data?.Identities?.docs ?? [];
    const loading = submittedSearchValue.length > 0 ? searchedIdentities.isLoading : defaultIdentities.isLoading;

    return (
        <SearchDrawer
            title="Tribe search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
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
                refetch={submittedSearchValue.length > 0 ? searchedIdentities.refetch : defaultIdentities.refetch}
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
