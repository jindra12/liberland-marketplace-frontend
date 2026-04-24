import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Space, Tag, Typography } from "antd";

import { ListIdentitiesQuery } from "../../generated/graphql";
import { useDislikeIdentityMutation, useLikeIdentityMutation } from "../hooks";
import { Markdown } from "../Markdown";
import { getImage } from "../shared/image/utils";

import { SplashCard } from "./SplashCard";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type IdentityItem = NonNullable<NonNullable<ListIdentitiesQuery["Identities"]>["docs"]>[number];
type IdentityCardProps = {
    items: IdentityItem[];
    loading?: boolean;
};

export const IdentityCard: React.FunctionComponent<IdentityCardProps> = (props) => {
    const likeMutation = useLikeIdentityMutation();
    const dislikeMutation = useDislikeIdentityMutation();

    return (
        <SplashCard
            className="SplashEntityCard--tribes"
            items={props.items}
            loading={props.loading}
            renderItem={(identity) => {
                const imageSrc = getImage(identity);
                const detailPath = `/tribes/${identity.id}`;
                const shareTitle = identity.name;
                const shareText = `Check out ${identity.name} on NSwap.`;

                return (
                    <SplashCardItem
                        id={identity.id}
                        detailPath={detailPath}
                        title={identity.name}
                        avatar={
                            imageSrc ? (
                                <Link to={detailPath}>
                                    <Avatar
                                        shape="square"
                                        size={80}
                                        src={imageSrc}
                                        className="SplashEntityCard__avatar"
                                    />
                                </Link>
                            ) : null
                        }
                        liked={identity.hasLiked}
                        likeCount={identity.likeCount}
                        serverURL={identity.serverURL}
                        likeActions={{
                            likeMutation,
                            dislikeMutation,
                        }}
                        actions={[
                            <SplashShareDetailActionRow
                                key={`identity-actions-${identity.id}`}
                                detailPath={detailPath}
                                title={shareTitle}
                                text={shareText}
                            />,
                        ]}
                    >
                        <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                            {identity.itemCount !== null &&
                                identity.itemCount !== undefined &&
                                identity.itemCount > 0 && <Tag color="blue">{`${identity.itemCount} listings`}</Tag>}
                            {identity.website && (
                                <Typography.Link href={identity.website} target="_blank" rel="noreferrer">
                                    Website
                                </Typography.Link>
                            )}
                        </Space>
                        {identity.description && (
                            <Markdown className="Markdown--clamp2 EntityList__description">
                                {identity.description}
                            </Markdown>
                        )}
                    </SplashCardItem>
                );
            }}
        />
    );
};
