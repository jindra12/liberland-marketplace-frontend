import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, List, Space, Tag, Typography } from "antd";
import { ListStartupsByIdentityQuery } from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";

type VentureItem = NonNullable<NonNullable<ListStartupsByIdentityQuery["Startups"]>["docs"]>[number];

type VentureCardProps = {
    items: VentureItem[];
    loading?: boolean;
};

export const VentureCard: React.FunctionComponent<VentureCardProps> = ({
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
            renderItem={(venture) => {
                const imageUrl = venture.image?.url;
                return (
                    <List.Item
                        actions={[
                            (
                                <Link key={`venture-link-${venture.id}`} to={`/ventures/${venture.id}`}>
                                    <Button>Details</Button>
                                </Link>
                            ),
                        ]}
                    >
                        <div className="SplashEntityCard__itemBody">
                            <List.Item.Meta
                                avatar={imageUrl ? (
                                    <Link to={`/ventures/${venture.id}`}>
                                        <Avatar
                                            shape="square"
                                            size={48}
                                            src={`${BACKEND_URL}${imageUrl}`}
                                            className="SplashEntityCard__avatar"
                                        />
                                    </Link>
                                ) : undefined}
                                title={(
                                    <Link to={`/ventures/${venture.id}`} className="SplashEntityCard__itemLink">
                                        {venture.title}
                                    </Link>
                                )}
                            />
                            <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                {venture.stage && <Tag>{venture.stage}</Tag>}
                            </Space>
                        </div>
                    </List.Item>
                );
            }}
        />
    </Card>
);
