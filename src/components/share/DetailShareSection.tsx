import * as React from "react";

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

import { LinkOutlined } from "@ant-design/icons";
import { Button, Flex, Grid, Space, Typography } from "antd";

import { ReportAction } from "../report/ReportAction";

import { NativeShareButton } from "./NativeShareButton";
import { SubscribeButton } from "./SubscribeButton/SubscribeButton";
import type { SubscriptionTarget } from "./SubscribeButton/types";
import { useCopyLink } from "./useCopyLink";

type SharePayload = {
    title: string;
    text: string;
    url: string;
    onCopyLink: () => void;
    subscriptionTarget?: SubscriptionTarget | null;
};
type ShareButtonConfig = {
    key: string;
    render: (payload: SharePayload) => React.ReactNode;
};
type DetailShareSectionProps = {
    label: string;
    title: string;
    text: string;
    url?: string;
    serverURL?: string | null;
    subscriptionTarget?: SubscriptionTarget | null;
    reportPath?: string;
};
const SHARE_BUTTONS: ShareButtonConfig[] = [
    {
        key: "copy",
        render: ({ onCopyLink }: SharePayload) => (
            <Button icon={<LinkOutlined />} className="ShareSection__nativeButton" onClick={onCopyLink}>
                Copy Link
            </Button>
        ),
    },
    {
        key: "subscribe",
        render: ({ subscriptionTarget }: SharePayload) =>
            subscriptionTarget ? <SubscribeButton {...subscriptionTarget} /> : null,
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
            <LinkedinShareButton url={url} title={title} summary={text} className="ShareSection__iconButton">
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
export const DetailShareSection: React.FunctionComponent<DetailShareSectionProps> = (props) => {
    const { md } = Grid.useBreakpoint();
    const { copyLink, messageContextHolder } = useCopyLink();
    const shareUrl = props.url ?? window.location.href;
    const reportPath = props.reportPath ?? window.location.pathname;
    const mobileShareActionSize = "middle";
    const payload = {
        title: props.title,
        text: props.text,
        url: shareUrl,
        onCopyLink: async () => {
            await copyLink(shareUrl);
        },
        subscriptionTarget: props.subscriptionTarget,
    };
    if (!md) {
        return (
            <>
                {messageContextHolder}
                <Flex vertical gap={12} className="ShareSection ShareSection--mobile">
                    <Typography.Text className="ShareSection__label">{props.label}</Typography.Text>
                    {props.subscriptionTarget ? (
                        <Space.Compact block className="ShareSection__mobileActions">
                            <NativeShareButton
                                url={shareUrl}
                                title={props.title}
                                text={props.text}
                                label="Share"
                                size={mobileShareActionSize}
                                className="NativeShareButton ShareSection__mobileButton"
                            />
                            <SubscribeButton
                                {...props.subscriptionTarget}
                                size={mobileShareActionSize}
                                className="ShareSection__mobileButton"
                            />
                        </Space.Compact>
                    ) : (
                        <Space.Compact block className="ShareSection__mobileActions">
                            <NativeShareButton
                                url={shareUrl}
                                title={props.title}
                                text={props.text}
                                label="Share"
                                size={mobileShareActionSize}
                                className="NativeShareButton ShareSection__mobileButton"
                            />
                        </Space.Compact>
                    )}
                    <Flex justify="flex-end" className="ShareSection__mobileReportRow">
                        <ReportAction contentLink={reportPath} serverURL={props.serverURL} className="ShareSection__reportButton" />
                    </Flex>
                </Flex>
            </>
        );
    }
    return (
        <>
            {messageContextHolder}
            <Flex justify="space-between" align="center" wrap gap="16px" className="ShareSection">
                <Typography.Text className="ShareSection__label">{props.label}</Typography.Text>
                <Flex wrap gap="12px" align="center" className="ShareSection__actions">
                    <Space size={[12, 12]} wrap className="ShareSection__buttons">
                        {SHARE_BUTTONS.map(({ key, render }) => (
                            <React.Fragment key={key}>{render(payload)}</React.Fragment>
                        ))}
                    </Space>
                    <ReportAction contentLink={reportPath} serverURL={props.serverURL} className="ShareSection__reportButton" />
                </Flex>
            </Flex>
        </>
    );
};
