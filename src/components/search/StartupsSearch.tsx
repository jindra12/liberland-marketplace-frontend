import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex, Tag } from "antd";

import { Post_RelatedPosts_RelationTo } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { formatStageLabel, formatResourceLabel } from "../../startupUtils";
import { useListStartupsQuery, useSearchStartupsQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";
import type { RelatedTargetSelection } from "../shared/post/types";

import { SEARCH_DRAWER_SCROLLABLE_ID } from "./constants";
import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchStartups } from "./utils";

export interface StartupsSearchProps {
    onClose: () => void;
    onSelect?: (value: RelatedTargetSelection) => void;
}

export const StartupsSearch: React.FunctionComponent<StartupsSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const [page, setPage] = React.useState(1);
    const defaultStartups = useListStartupsQuery({
        limit: 5,
        page: 1,
    });
    const searchedStartups = useSearchStartupsQuery(
        {
            searchTerm: submittedSearchValue,
            limit: 5,
            page,
        },
        {
            enabled: submittedSearchValue.length > 0,
        },
    );
    const searchDocs = useAccumulatedDocs(searchedStartups.data?.Searches?.docs, page);
    const items =
        submittedSearchValue.length > 0
            ? mapSearchStartups(searchDocs)
            : defaultStartups.data?.Startups?.docs ?? [];
    const loading =
        submittedSearchValue.length > 0
            ? searchedStartups.isLoading && searchDocs.length === 0
            : defaultStartups.isLoading;
    const hasMore = submittedSearchValue.length > 0 ? Boolean(searchedStartups.data?.Searches?.hasNextPage) : false;
    const handleSelect = (startup: { id: string; title?: string | null }) => {
        props.onSelect?.({
            relationTo: Post_RelatedPosts_RelationTo.Startups,
            value: startup.id,
            label: startup.title || "Venture",
        });
        props.onClose();
    };

    return (
        <SearchDrawer
            title="Startup search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
                setPage(1);
            }}
            placeholder="Search ventures"
        >
            <SearchResultsList
                title={
                    submittedSearchValue.length > 0
                        ? `Search results for "${submittedSearchValue}"`
                        : "Ventures"
                }
                onSelectItem={props.onSelect ? handleSelect : undefined}
                items={items}
                loading={loading}
                hasMore={hasMore}
                next={() => {
                    setPage((currentPage) => currentPage + 1);
                }}
                refetch={submittedSearchValue.length > 0 ? searchedStartups.refetch : defaultStartups.refetch}
                scrollableTarget={SEARCH_DRAWER_SCROLLABLE_ID}
                emptyText="No matching ventures"
                renderItem={{
                    title: (startup) => (
                        <Flex justify="space-between" align="center" wrap>
                            <Flex align="center" gap={8}>
                                <Link to={`/ventures/${startup.id}`} onClick={props.onClose}>
                                    {startup.title}
                                </Link>
                            </Flex>
                            <Flex gap={4} wrap>
                                <Tag color="blue">{formatStageLabel(startup.stage)}</Tag>
                                {startup.identity?.name && (
                                    <IdentityTagLink identity={startup.identity} color="success" />
                                )}
                            </Flex>
                        </Flex>
                    ),
                    avatar: (startup) =>
                        startup.image?.url ? (
                            <Link to={`/ventures/${startup.id}`} onClick={props.onClose}>
                                <Avatar
                                    shape="square"
                                    size={80}
                                    src={getImage(startup) || getImage(startup?.company)}
                                    className="EntityList__avatar"
                                />
                            </Link>
                        ) : undefined,
                    description: (startup) => (
                        <Flex gap={4} wrap className="StartupList__meta">
                            {startup.company?.name && <Tag>{startup.company.name}</Tag>}
                            {startup.lookingFor?.map((r) => (
                                <Tag key={r} color="orange">
                                    {formatResourceLabel(r)}
                                </Tag>
                            ))}
                        </Flex>
                    ),
                    body: (startup) => (
                        <Markdown className="Markdown--clamp3 EntityList__description">{startup.description}</Markdown>
                    ),
                }}
            />
        </SearchDrawer>
    );
};
