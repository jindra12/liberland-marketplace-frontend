import * as React from "react";

import { Flex } from "antd";

import { RouteButton } from "../RouteButton";
import { NativeShareButton } from "../share/NativeShareButton";

type SplashShareDetailActionRowProps = {
    detailPath: string;
    title: string;
    text: string;
};
export const SplashShareDetailActionRow: React.FunctionComponent<SplashShareDetailActionRowProps> = (props) => {
    return (
        <Flex wrap gap={8} className="SplashEntityCard__inlineActions SplashEntityCard__actionGroup">
            <RouteButton to={props.detailPath} type="primary">
                Details
            </RouteButton>
            <NativeShareButton
                path={props.detailPath}
                title={props.title}
                text={props.text}
                type="text"
                className="NativeShareButton"
            />
        </Flex>
    );
};
