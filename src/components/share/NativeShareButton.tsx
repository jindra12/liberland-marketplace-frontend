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

export const NativeShareButton: React.FunctionComponent<NativeShareButtonProps> = ({
    path,
    url,
    title,
    text,
    className,
    label = "Share",
    size = "middle",
    type = "default",
}) => {
    const shareUrl = url ?? `${window.location.origin}${path ?? ""}`;

    return (
        <RWebShare
            data={{
                title: title ?? text,
                text,
                url: shareUrl,
            }}
            sites={FALLBACK_SITES}
        >
            <Button
                icon={<ShareAltOutlined />}
                className={className}
                size={size}
                type={type}
            >
                {label}
            </Button>
        </RWebShare>
    );
};
