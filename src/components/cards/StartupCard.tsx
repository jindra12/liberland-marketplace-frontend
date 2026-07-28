import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Space, Tag } from "antd";

import { ListStartupsQuery, Startup } from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";
import { routes } from "../../routes";
import { useDislikeVentureMutation, useLikeVentureMutation } from "../hooks";
import { IdentityTagLink } from "../shared/IdentityTagLink";

import { SplashCard } from "./SplashCard";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type StartupItem = NonNullable<NonNullable<ListStartupsQuery["Startups"]>["docs"]>[number];
type StartupCardProps = {
    items: StartupItem[];
    loading?: boolean;
};

export const StartupCard: React.FunctionComponent<StartupCardProps> = (props) => {
    const likeMutation = useLikeVentureMutation();
    const dislikeMutation = useDislikeVentureMutation();

    return (
        <SplashCard
            className="SplashEntityCard--ventures"
            items={props.items}
            loading={props.loading}
            renderItem={(startup) => {
                const imageUrl = startup.image?.url;
                const detailPath = routes.ventures.detail.getLink(startup as Startup);

                return (
                    <SplashCardItem
                        id={startup.id}
                        detailPath={detailPath}
                        title={startup.title || "Venture"}
                        avatar={
                            imageUrl ? (
                                <Link to={detailPath}>
                                    <Avatar
                                        shape="square"
                                        size={80}
                                        src={`${BACKEND_URL}${imageUrl}`}
                                        className="SplashEntityCard__avatar"
                                    />
                                </Link>
                            ) : null
                        }
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
                                detailPath={detailPath}
                                title={startup.title || "Venture"}
                                text={`Check out ${startup.title} on NSwap.`}
                            />,
                        ]}
                    >
                        {startup.identity && (
                            <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                <IdentityTagLink identity={startup.identity} color="success" />
                            </Space>
                        )}
                        <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                            {startup.stage && <Tag>{startup.stage}</Tag>}
                        </Space>
                    </SplashCardItem>
                );
            }}
        />
    );
};
