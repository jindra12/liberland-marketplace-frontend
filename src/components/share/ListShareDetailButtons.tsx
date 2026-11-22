import * as React from "react";

import { Flex } from "antd";
import type { ButtonProps } from "antd";

import { RouteButton } from "../RouteButton";

import { NativeShareButton } from "./NativeShareButton";
import { SubscribeButton } from "./SubscribeButton/SubscribeButton";
import type { SubscriptionTarget } from "./SubscribeButton/types";

type ListShareDetailButtonsProps = {
    detailPath: string;
    title?: string | null;
    text: string;
    size?: ButtonProps["size"];
    compact?: boolean;
    subscriptionTarget?: SubscriptionTarget | null;
};

export const ListShareDetailButtons: React.FunctionComponent<ListShareDetailButtonsProps> = (props) => {
    return (
        <Flex wrap align="center" gap={props.compact ? 8 : 12} className="ListShareDetailButtons">
            <RouteButton
                to={props.detailPath}
                type="primary"
                size={props.size || "middle"}
                className="ActionBtn ListShareDetailButtons__details"
            >
                Details
            </RouteButton>
            <NativeShareButton
                path={props.detailPath}
                title={props.title}
                text={props.text}
                size={props.size || "middle"}
                type="text"
                className="NativeShareButton"
            />
            {props.subscriptionTarget ? (
                <SubscribeButton {...props.subscriptionTarget} size={props.size || "middle"} type="text" />
            ) : null}
        </Flex>
    );
};
