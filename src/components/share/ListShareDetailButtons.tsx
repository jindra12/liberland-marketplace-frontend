import * as React from "react";

import { Flex, Grid, Space } from "antd";
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
    const { sm } = Grid.useBreakpoint();
    const size = props.size === undefined ? "large" : props.size;
    const compact = props.compact === undefined ? false : props.compact;
    const compactShareActionSize = compact && size === "large" ? "middle" : size;

    if (!sm) {
        return (
            <Flex vertical gap="8px" className="ListShareDetailButtons ListShareDetailButtons--stacked">
                <NativeShareButton
                    path={props.detailPath}
                    title={props.title}
                    text={props.text}
                    size={compactShareActionSize}
                    className="NativeShareButton ListShareDetailButtons__button"
                />
                {props.subscriptionTarget ? (
                    <SubscribeButton
                        {...props.subscriptionTarget}
                        size={compactShareActionSize}
                        className="ListShareDetailButtons__button"
                    />
                ) : null}
                <RouteButton
                    to={props.detailPath}
                    type="primary"
                    size={size}
                    className="ActionBtn ListShareDetailButtons__button"
                >
                    Details
                </RouteButton>
            </Flex>
        );
    }

    return compact ? (
        <Space.Compact block className="ListShareDetailButtons ListShareDetailButtons--compact">
            <NativeShareButton
                path={props.detailPath}
                title={props.title}
                text={props.text}
                size={compactShareActionSize}
                className="NativeShareButton"
            />
            {props.subscriptionTarget ? (
                <SubscribeButton {...props.subscriptionTarget} size={compactShareActionSize} />
            ) : null}
            <RouteButton to={props.detailPath} size={size} className="ActionBtn">
                Details
            </RouteButton>
        </Space.Compact>
    ) : (
        <Flex wrap gap="12px" className="ListShareDetailButtons">
            <NativeShareButton
                path={props.detailPath}
                title={props.title}
                text={props.text}
                size={size}
                className="NativeShareButton"
            />
            {props.subscriptionTarget ? <SubscribeButton {...props.subscriptionTarget} size={size} /> : null}
            <RouteButton to={props.detailPath} type="primary" size={size} className="ActionBtn">
                Details
            </RouteButton>
        </Flex>
    );
};
