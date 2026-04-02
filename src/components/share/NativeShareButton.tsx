import * as React from "react";
import { ShareAltOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ButtonProps } from "antd";
import { RWebShare } from "react-web-share";
const FALLBACK_SITES = ["copy", "facebook", "twitter", "linkedin", "reddit", "whatsapp", "telegram"];
type NativeShareButtonProps = {
    path?: string;
    url?: string;
    title?: string | null;
    text: string;
    className?: string;
    label?: React.ReactNode;
    size?: ButtonProps["size"];
    type?: ButtonProps["type"];
};
export const NativeShareButton: React.FunctionComponent<NativeShareButtonProps> = (props) => {
    const label = props.label === undefined ? "Share" : props.label;
    const size = props.size === undefined ? "middle" : props.size;
    const type = props.type === undefined ? "default" : props.type;
    const shareUrl = props.url ?? `${window.location.origin}${props.path ?? ""}`;
    return (
        <RWebShare
            data={{
                title: props.title ?? props.text,
                text: props.text,
                url: shareUrl,
            }}
            sites={FALLBACK_SITES}
        >
            <Button icon={<ShareAltOutlined />} className={props.className} size={size} type={type}>
                {label}
            </Button>
        </RWebShare>
    );
};
