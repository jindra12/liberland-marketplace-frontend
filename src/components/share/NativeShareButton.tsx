import * as React from "react";

import { RWebShare } from "react-web-share";

import { ShareAltOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ButtonProps } from "antd";

const FALLBACK_SITES = ["copy", "facebook", "twitter", "linkedin", "reddit", "whatsapp", "telegram"];
type NativeShareButtonProps = {
    path?: string;
    url?: string;
    title?: string | null;
    text: string;
    className?: string;
    label?: string;
    size?: ButtonProps["size"];
    type?: ButtonProps["type"];
};
export const NativeShareButton: React.FunctionComponent<NativeShareButtonProps> = (props) => {
    return (
        <RWebShare
            data={{
                title: props.title || props.label || props.text,
                text: props.text,
                url: props.url ?? `${window.location.origin}${props.path ?? ""}`,
            }}
            sites={FALLBACK_SITES}
        >
            <Button
                icon={<ShareAltOutlined />}
                className={props.className}
                size={props.size || "middle"}
                type={props.type || "default"}
            >
                {props.label || "Share"}
            </Button>
        </RWebShare>
    );
};
