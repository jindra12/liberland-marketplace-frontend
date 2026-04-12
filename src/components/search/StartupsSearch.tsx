import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex, Tag } from "antd";

import { formatStageLabel, formatResourceLabel } from "../../startupUtils";
import { useListStartupsQuery, useSearchStartupsQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchStartups } from "./utils";

export interface StartupsSearchProps {
    onClose: () => void;
}

export const StartupsSearch: React.FunctionComponent<StartupsSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const defaultStartups = useListStartupsQuery({
        limit: 5,
        page: 1,
    });
    const searchedStartups = useSearchStartupsQuery(
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
            ? mapSearchStartups(searchedStartups.data?.Searches?.docs)
            : defaultStartups.data?.Startups?.docs ?? [];
    const loading = submittedSearchValue.length > 0 ? searchedStartups.isLoading : defaultStartups.isLoading;

    return (
        <SearchDrawer
            title="Startup search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
            }}
            placeholder="Search ventures"
        >
            <SearchResultsList
                title={
                    submittedSearchValue.length > 0
                        ? `Search results for "${submittedSearchValue}"`
                        : "Ventures"
                }
                items={items}
                loading={loading}
                refetch={submittedSearchValue.length > 0 ? searchedStartups.refetch : defaultStartups.refetch}
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
