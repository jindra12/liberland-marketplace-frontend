import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Card, Grid, List, Space, Tag, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { ListStartupsByIdentityQuery } from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";
import { RouteButton } from "../RouteButton";

type StartupItem = NonNullable<NonNullable<ListStartupsByIdentityQuery["Startups"]>["docs"]>[number];

type StartupCardProps = {
    items: StartupItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};

export const StartupCard: React.FunctionComponent<StartupCardProps> = ({
    items,
    loading,
    totalDocs,
    identityId,
}) => {
    const { xl } = Grid.useBreakpoint();
    const remaining = totalDocs !== undefined ? totalDocs - items.length : 0;
    return (
        <Card
            className="SplashEntityCard SplashEntityCard--ventures"
            title={(
                <Typography.Title level={3} className="SplashEntityCard__title">
                    <Link to="/ventures" className="SplashEntityCard__titleLink">Ventures</Link>
                </Typography.Title>
            )}
        >
            <List
                className="SplashEntityCard__list"
                loading={loading}
                dataSource={items}
                locale={{ emptyText: "Coming soon!" }}
                renderItem={(startup) => {
                    const imageUrl = startup.image?.url;
                    return (
                        <List.Item
                            actions={xl ? [(
                                <SplashShareDetailActionRow
                                    key={`startup-actions-${startup.id}`}
                                    detailPath={`/ventures/${startup.id}`}
                                    title={startup.title || "Venture"}
                                    text={`Check out ${startup.title} on NSwap.`}
                                />
                            )] : undefined}
                        >
                            <div className="SplashEntityCard__itemBody">
                                <List.Item.Meta
                                    avatar={imageUrl ? (
                                        <Link to={`/ventures/${startup.id}`}>
                                            <Avatar
                                                shape="square"
                                                size={48}
                                                src={`${BACKEND_URL}${imageUrl}`}
                                                className="SplashEntityCard__avatar"
                                            />
                                        </Link>
                                    ) : undefined}
                                    title={(
                                        <Link to={`/ventures/${startup.id}`} className="SplashEntityCard__itemLink">
                                            {startup.title}
                                        </Link>
                                    )}
                                />
                                <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                    {startup.stage && <Tag>{startup.stage}</Tag>}
                                </Space>
                                {!xl && (
                                    <SplashShareDetailActionRow
                                        detailPath={`/ventures/${startup.id}`}
                                        title={startup.title || "Venture"}
                                        text={`Check out ${startup.title} on NSwap.`}
                                    />
                                )}
                            </div>
                        </List.Item>
                    );
                }}
            />
            {remaining > 0 && identityId && (
                <RouteButton
                    to={`/ventures?tribe=${identityId}`}
                    type="link"
                    icon={<RightOutlined />}
                    iconPosition="end"
                    className="SplashEntityCard__moreLink"
                >
                    And +{remaining} more
                </RouteButton>
            )}
        </Card>
    );
};
