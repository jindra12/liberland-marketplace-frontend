import * as React from "react";

import { Space } from "antd";

import { RouteButton } from "../RouteButton";
import { NativeShareButton } from "../share/NativeShareButton";

type SplashShareDetailActionRowProps = {
    detailPath: string;
    title: string;
    text: string;
};
export const SplashShareDetailActionRow: React.FunctionComponent<SplashShareDetailActionRowProps> = (props) => {
    return (
        <div className="SplashEntityCard__inlineActions">
            <Space.Compact block className="SplashEntityCard__actionGroup SplashEntityCard__actionGroup--compact">
                <NativeShareButton
                    path={props.detailPath}
                    title={props.title}
                    text={props.text}
                    size="small"
                    className="NativeShareButton"
                />
                <RouteButton to={props.detailPath} type="primary" size="small">
                    Details
                </RouteButton>
            </Space.Compact>
        </div>
    );
};
