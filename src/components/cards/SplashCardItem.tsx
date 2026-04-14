import * as React from "react";

import { Link } from "react-router-dom";

import { Flex, Grid } from "antd";
import { Card, Typography } from "antd";

import { Like } from "../shared/Like/Like";

import type { SplashCardItemProps } from "./types";

export const SplashCardItem: React.FunctionComponent<SplashCardItemProps> = (props) => {
    const { md } = Grid.useBreakpoint();
    const actionContent: React.ReactNode[] = [];

    if (props.likeActions) {
        actionContent.push(
            <Like
                key={`like-${props.id}`}
                id={props.id}
                liked={props.liked}
                likeCount={props.likeCount ?? 0}
                serverURL={props.serverURL}
                likeMutation={props.likeActions.likeMutation}
                dislikeMutation={props.likeActions.dislikeMutation}
            />,
        );
    }

    if (props.actions) {
        actionContent.push(...props.actions);
    }

    const wrappedActions =
        actionContent.length > 0 ? (
            <Flex
                vertical={!md}
                justify={md ? "flex-end" : undefined}
                align={md ? "center" : "flex-start"}
                gap="12px"
                className={`SplashEntityCard__actions${md ? "" : " SplashEntityCard__actions--stacked"}`}
            >
                {actionContent}
            </Flex>
        ) : undefined;

    return (
        <Card className="SplashEntityCard__itemCard" bordered={false}>
            <Flex vertical gap="14px" className="SplashEntityCard__itemBody">
                <Flex align="start" gap="14px" className="SplashEntityCard__itemHeader">
                    {props.avatar}
                    <Flex vertical gap="4px" className="SplashEntityCard__itemHeading">
                        <Typography.Title level={4} className="SplashEntityCard__itemTitle">
                            <Link to={props.detailPath} className="SplashEntityCard__itemLink">
                                {props.title}
                            </Link>
                        </Typography.Title>
                        {props.children}
                    </Flex>
                </Flex>
                {wrappedActions}
            </Flex>
        </Card>
    );
};
