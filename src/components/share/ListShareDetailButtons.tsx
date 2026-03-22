import * as React from "react";
import { Flex, Space } from "antd";
import type { ButtonProps } from "antd";
import { NativeShareButton } from "./NativeShareButton";
import { RouteButton } from "../RouteButton";

type ListShareDetailButtonsProps = {
    detailPath: string;
    title?: string | null;
    text: string;
    size?: ButtonProps["size"];
    compact?: boolean;
    desktopDetailButtonType?: ButtonProps["type"];
};

export const ListShareDetailButtons: React.FunctionComponent<ListShareDetailButtonsProps> = ({
    detailPath,
    title,
    text,
    size = "large",
    compact = false,
    desktopDetailButtonType,
}) => {
    return compact ? (
        <Space.Compact block className="ListShareDetailButtons ListShareDetailButtons--compact">
            <NativeShareButton
                path={detailPath}
                title={title}
                text={text}
                size={size}
                className="NativeShareButton"
            />
            <RouteButton
                to={detailPath}
                size={size}
                className="ActionBtn"
            >
                Details
            </RouteButton>
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
            <RouteButton
                to={detailPath}
                type={desktopDetailButtonType}
                size={size}
                className="ActionBtn"
            >
                Details
            </RouteButton>
        </Flex>
    );
};
