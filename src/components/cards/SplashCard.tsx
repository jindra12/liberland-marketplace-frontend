import * as React from "react";

import { Link } from "react-router-dom";

import { RightOutlined } from "@ant-design/icons";
import { Card, List, Typography } from "antd";

import { RouteButton } from "../RouteButton";

import type { SplashCardProps } from "./types";
import { getRemainingDocs } from "./utils";

export const SplashCard = <TItem,>(props: SplashCardProps<TItem>) => {
    const remaining = getRemainingDocs(props.totalDocs, props.items.length);

    return (
        <Card
            className={`SplashEntityCard ${props.className}`}
            title={
                <Typography.Title level={3} className="SplashEntityCard__title">
                    <Link to={props.titleRoute} className="SplashEntityCard__titleLink">
                        {props.title}
                    </Link>
                </Typography.Title>
            }
        >
            <List
                className="SplashEntityCard__list"
                loading={props.loading}
                dataSource={props.items}
                locale={{
                    emptyText: props.emptyText ?? "Coming soon!",
                }}
                renderItem={(item) => props.renderItem(item)}
            />
            {remaining > 0 && props.identityId && (
                <RouteButton
                    to={props.buildMoreLinkRoute(props.identityId)}
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
