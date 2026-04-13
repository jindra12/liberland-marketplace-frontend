import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, List, Space, Tag } from "antd";

import { ListStartupsByIdentityQuery } from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";
import { useDislikeVentureMutation, useLikeVentureMutation } from "../hooks";

import { SplashCard } from "./SplashCard";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type StartupItem = NonNullable<NonNullable<ListStartupsByIdentityQuery["Startups"]>["docs"]>[number];
type StartupCardProps = {
    items: StartupItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};
export const StartupCard: React.FunctionComponent<StartupCardProps> = (props) => {
    const likeMutation = useLikeVentureMutation();
    const dislikeMutation = useDislikeVentureMutation();
    return (
        <SplashCard
            className="SplashEntityCard--ventures"
            title="Ventures"
            titleRoute="/ventures"
            items={props.items}
            loading={props.loading}
            totalDocs={props.totalDocs}
            identityId={props.identityId}
            buildMoreLinkRoute={(identityId) => `/ventures?tribe=${identityId}`}
            renderItem={(startup) => {
                const imageUrl = startup.image?.url;
                return (
                    <SplashCardItem
                        id={startup.id}
                        liked={startup.hasLiked}
                        likeCount={startup.likeCount}
                        serverURL={startup.serverURL}
                        likeActions={{
                            likeMutation,
                            dislikeMutation,
                        }}
                        actions={[
                            <SplashShareDetailActionRow
                                key={`startup-actions-${startup.id}`}
                                detailPath={`/ventures/${startup.id}`}
                                title={startup.title || "Venture"}
                                text={`Check out ${startup.title} on NSwap.`}
                            />,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                imageUrl ? (
                                    <Link to={`/ventures/${startup.id}`}>
                                        <Avatar
                                            shape="square"
                                            size={48}
                                            src={`${BACKEND_URL}${imageUrl}`}
                                            className="SplashEntityCard__avatar"
                                        />
                                    </Link>
                                ) : undefined
                            }
                            title={
                                <Link to={`/ventures/${startup.id}`} className="SplashEntityCard__itemLink">
                                    {startup.title}
                                </Link>
                            }
                        />
                            <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                {startup.stage && <Tag>{startup.stage}</Tag>}
                            </Space>
                        </SplashCardItem>
                    );
                }}
        />
    );
};
