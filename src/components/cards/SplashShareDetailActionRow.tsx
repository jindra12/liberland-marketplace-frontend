import * as React from "react";
import { Space } from "antd";
import { NativeShareButton } from "../share/NativeShareButton";
import { RouteButton } from "../RouteButton";

type SplashShareDetailActionRowProps = {
    detailPath: string;
    title: string;
    text: string;
};

export const SplashShareDetailActionRow: React.FunctionComponent<SplashShareDetailActionRowProps> = ({
    detailPath,
    title,
    text,
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
            <RouteButton
                to={detailPath}
                type="primary"
                size="small"
            >
                Details
            </RouteButton>
        </Space.Compact>
    </div>
);
