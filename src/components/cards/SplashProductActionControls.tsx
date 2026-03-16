import * as React from "react";
import { Flex, Space } from "antd";
import { NativeShareButton } from "../share/NativeShareButton";

type SplashProductActionControlsProps = {
    detailPath: string;
    title: string;
    text: string;
    purchaseAction?: React.ReactNode;
    desktopLayout?: "inline" | "stacked";
    inline?: boolean;
};

export const SplashProductActionControls: React.FunctionComponent<SplashProductActionControlsProps> = ({
    detailPath,
    title,
    text,
    purchaseAction,
    desktopLayout = "inline",
    inline,
}) => {
    const shareButton = (
        <NativeShareButton
            path={detailPath}
            title={title}
            text={text}
            size="small"
            className="NativeShareButton"
        />
    );

    const content = desktopLayout === "stacked" ? (
        <Flex
            vertical
            align="flex-end"
            gap={12}
            className="SplashEntityCard__actionGroup SplashEntityCard__actionGroup--productsDesktop"
        >
            {purchaseAction ? (
                <div className="SplashEntityCard__purchaseAction">
                    {purchaseAction}
                </div>
            ) : null}
            {shareButton}
        </Flex>
    ) : (
        <Space size={8} wrap className="SplashEntityCard__actionGroup">
            {shareButton}
            {purchaseAction}
        </Space>
    );

    if (!inline) {
        return content;
    }

    return (
        <div className="SplashEntityCard__inlineActions">
            {content}
        </div>
    );
};
