import * as React from "react";
import { Button, Flex, Space } from "antd";
import type { ButtonProps } from "antd";
import { useNavigate } from "react-router-dom";
import { NativeShareButton } from "./NativeShareButton";
import { SubscribeButton } from "./SubscribeButton/SubscribeButton";
import type { SubscriptionTarget } from "./SubscribeButton/types";

type ListShareDetailButtonsProps = {
    detailPath: string;
    title?: string | null;
    text: string;
    size?: ButtonProps["size"];
    compact?: boolean;
    desktopDetailButtonType?: ButtonProps["type"];
    subscriptionTarget?: SubscriptionTarget | null;
};

export const ListShareDetailButtons: React.FunctionComponent<ListShareDetailButtonsProps> = ({
    detailPath,
    title,
    text,
    size = "large",
    compact = false,
    desktopDetailButtonType,
    subscriptionTarget,
}) => {
    const navigate = useNavigate();
    const compactShareActionSize = compact && size === "large" ? "middle" : size;

    return compact ? (
        <Space.Compact block className="ListShareDetailButtons ListShareDetailButtons--compact">
            <NativeShareButton
                path={detailPath}
                title={title}
                text={text}
                size={compactShareActionSize}
                className="NativeShareButton"
            />
            {subscriptionTarget ? (
                <SubscribeButton
                    {...subscriptionTarget}
                    size={compactShareActionSize}
                />
            ) : null}
            <Button
                size={size}
                className="ActionBtn"
                onClick={() => navigate(detailPath)}
            >
                Details
            </Button>
        </Space.Compact>
    ) : (
        <Flex wrap gap="12px" className="ListShareDetailButtons">
            <NativeShareButton
                path={detailPath}
                title={title}
                text={text}
                size={size}
                className="NativeShareButton"
            />
            {subscriptionTarget ? (
                <SubscribeButton
                    {...subscriptionTarget}
                    size={size}
                />
            ) : null}
            <Button
                type={desktopDetailButtonType}
                size={size}
                className="ActionBtn"
                onClick={() => navigate(detailPath)}
            >
                Details
            </Button>
        </Flex>
    );
};
