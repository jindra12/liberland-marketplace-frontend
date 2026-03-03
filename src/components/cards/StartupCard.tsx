import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, List, Space, Tag, Typography } from "antd";
import { ListStartupsByIdentityQuery } from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";

type StartupItem = NonNullable<NonNullable<ListStartupsByIdentityQuery["Startups"]>["docs"]>[number];

type StartupCardProps = {
    items: StartupItem[];
    loading?: boolean;
};

export const StartupCard: React.FunctionComponent<StartupCardProps> = ({
    items,
    loading,
}) => (
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
            locale={{ emptyText: "No ventures for this tribe" }}
            renderItem={(startup) => {
                const imageUrl = startup.image?.url;
                return (
                    <List.Item
                        actions={[
                            (
                                <Link key={`startup-link-${startup.id}`} to={`/ventures/${startup.id}`}>
                                    <Button>Details</Button>
                                </Link>
                            ),
                        ]}
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
                        </div>
                    </List.Item>
                );
            }}
        />
    </Card>
);
