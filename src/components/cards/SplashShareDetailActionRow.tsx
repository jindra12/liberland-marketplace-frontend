import * as React from "react";
import { Button, Space } from "antd";
import { NativeShareButton } from "../share/NativeShareButton";

type SplashShareDetailActionRowProps = {
    detailPath: string;
    title: string;
    text: string;
    onDetailsClick: () => void;
};

export const SplashShareDetailActionRow: React.FunctionComponent<SplashShareDetailActionRowProps> = ({
    detailPath,
    title,
    text,
    onDetailsClick,
}) => (
    <div className="SplashEntityCard__inlineActions">
        <Space.Compact
            block
            className="SplashEntityCard__actionGroup SplashEntityCard__actionGroup--compact"
        >
            <NativeShareButton
                path={detailPath}
                title={title}
                text={text}
                size="small"
                className="NativeShareButton"
            />
            <Button
                type="primary"
                size="small"
                onClick={onDetailsClick}
            >
                Details
            </Button>
        </Space.Compact>
    </div>
);
