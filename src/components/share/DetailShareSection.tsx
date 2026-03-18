import * as React from "react";
import { Button, Flex, Grid, Space, Typography } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import {
    FacebookIcon,
    FacebookShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    RedditIcon,
    RedditShareButton,
    WhatsappIcon,
    WhatsappShareButton,
    XIcon,
    XShareButton,
} from "react-share";
import { NativeShareButton } from "./NativeShareButton";
import { useCopyLink } from "./useCopyLink";
import { SubscribeButton } from "./SubscribeButton/SubscribeButton";
import type { SubscriptionTarget } from "./SubscribeButton/types";

type SharePayload = {
    title: string;
    text: string;
    url: string;
    onCopyLink: () => void;
};

type DetailShareSectionProps = {
    label: string;
    title: string;
    text: string;
    url?: string;
    subscriptionTarget?: SubscriptionTarget | null;
};

const SHARE_BUTTONS = [
    {
        key: "copy",
        render: ({ onCopyLink }: SharePayload) => (
            <Button
                icon={<LinkOutlined />}
                className="ShareSection__nativeButton"
                onClick={onCopyLink}
            >
                Copy Link
            </Button>
        ),
    },
    {
        key: "x",
        render: ({ url, text }: SharePayload) => (
            <XShareButton url={url} title={text} className="ShareSection__iconButton">
                <XIcon size={40} round />
            </XShareButton>
        ),
    },
    {
        key: "facebook",
        render: ({ url }: SharePayload) => (
            <FacebookShareButton url={url} hashtag="#nswap" className="ShareSection__iconButton">
                <FacebookIcon size={40} round />
            </FacebookShareButton>
        ),
    },
    {
        key: "linkedin",
        render: ({ url, title, text }: SharePayload) => (
            <LinkedinShareButton
                url={url}
                title={title}
                summary={text}
                className="ShareSection__iconButton"
            >
                <LinkedinIcon size={40} round />
            </LinkedinShareButton>
        ),
    },
    {
        key: "reddit",
        render: ({ url, text }: SharePayload) => (
            <RedditShareButton url={url} title={text} className="ShareSection__iconButton">
                <RedditIcon size={40} round />
            </RedditShareButton>
        ),
    },
    {
        key: "whatsapp",
        render: ({ url, text }: SharePayload) => (
            <WhatsappShareButton url={url} title={text} className="ShareSection__iconButton">
                <WhatsappIcon size={40} round />
            </WhatsappShareButton>
        ),
    },
];

export const DetailShareSection: React.FunctionComponent<DetailShareSectionProps> = ({
    label,
    title,
    text,
    url,
    subscriptionTarget,
}) => {
    const { md } = Grid.useBreakpoint();
    const { copyLink, messageContextHolder } = useCopyLink();
    const shareUrl = url ?? window.location.href;
    const payload = {
        title,
        text,
        url: shareUrl,
        onCopyLink: () => {
            void copyLink(shareUrl);
        },
    };

    if (!md) {
        return (
            <>
                {messageContextHolder}
                <Flex vertical gap={12} className="ShareSection ShareSection--mobile">
                    <Typography.Text className="ShareSection__label">
                        {label}
                    </Typography.Text>
                    {subscriptionTarget ? (
                        <Space.Compact block className="ShareSection__mobileActions">
                            <NativeShareButton
                                url={shareUrl}
                                title={title}
                                text={text}
                                label="Share"
                                size="large"
                                className="NativeShareButton ShareSection__mobileButton"
                            />
                            <SubscribeButton
                                {...subscriptionTarget}
                                size="large"
                                className="ShareSection__mobileButton"
                            />
                        </Space.Compact>
                    ) : (
                        <NativeShareButton
                            url={shareUrl}
                            title={title}
                            text={text}
                            label="Share"
                            size="large"
                            className="NativeShareButton ShareSection__mobileButton"
                        />
                    )}
                </Flex>
            </>
        );
    }

    return (
        <>
            {messageContextHolder}
            <Flex justify="space-between" align="center" wrap gap="16px" className="ShareSection">
                <Typography.Text className="ShareSection__label">
                    {label}
                </Typography.Text>
                <Flex wrap gap="12px" align="center" className="ShareSection__actions">
                    <Space size={[12, 12]} wrap className="ShareSection__utilityButtons">
                        {SHARE_BUTTONS[0].render(payload)}
                        {subscriptionTarget ? (
                            <SubscribeButton {...subscriptionTarget} />
                        ) : null}
                    </Space>
                    <Space size={[12, 12]} wrap className="ShareSection__buttons">
                        {SHARE_BUTTONS.slice(1).map(({ key, render }) => (
                            <React.Fragment key={key}>
                                {render(payload)}
                            </React.Fragment>
                        ))}
                    </Space>
                </Flex>
            </Flex>
        </>
    );
};
