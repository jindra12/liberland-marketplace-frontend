import * as React from "react";

import { Flex, Grid, List } from "antd";

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
                align={md ? "center" : "flex-end"}
                gap="12px"
                className={`SplashEntityCard__actions${md ? "" : " SplashEntityCard__actions--stacked"}`}
            >
                {actionContent}
            </Flex>
        ) : undefined;

    return (
        <List.Item actions={wrappedActions ? [wrappedActions] : undefined}>
            <div className="SplashEntityCard__itemBody">{props.children}</div>
        </List.Item>
    );
};
