import * as React from "react";

import { useParams } from "react-router-dom";

import { GlobalOutlined, PoweroffOutlined } from "@ant-design/icons";
import { Avatar, Button, Descriptions, Divider, Flex, Result, Tag, Typography } from "antd";

import { decodeServerUrlSegment, routes } from "../../routes";
import { useEndpointContext } from "../EndpointContext";
import { getSyndicationHost, getSyndicationName, setEndpointEnabled } from "../endpoints/utils";
import { Markdown } from "../Markdown";
import { RouteButton } from "../RouteButton";
import { SyndicationNsfwTag } from "../shared/SyndicationNsfwTag";

import { CommonDetail } from "./CommonDetail";

const SyndicationDetail: React.FunctionComponent = () => {
    const { serverUrl } = useParams<{ id: string; serverUrl: string }>();
    const { urls, setUrls } = useEndpointContext();

    const decodedServerURL = React.useMemo(() => {
        if (!serverUrl) {
            return "";
        }

        return decodeServerUrlSegment(serverUrl);
    }, [serverUrl]);

    const entry = React.useMemo(
        () => urls.find((current) => current.value === decodedServerURL),
        [decodedServerURL, urls],
    );

    if (!entry) {
        return (
            <Result
                status="404"
                title="Syndicated URL not found"
                subTitle="This syndicated URL is not available in your current marketplace context."
                extra={
                    <RouteButton to={routes.syndication.route} type="primary">
                        Back to syndication
                    </RouteButton>
                }
            />
        );
    }

    const host = getSyndicationHost(entry.value);
    const title = getSyndicationName(entry);
    const shareText = `Check out ${title} on NSwap.`;

    return (
        <CommonDetail
            className="SyndicationDetail"
            serverURL={entry.value}
            reportPath={routes.syndication.detail.getLink(entry)}
            backTo={routes.syndication.route}
            backLabel="Back to syndication"
            shareLabel="Share this endpoint"
            shareTitle={title}
            shareText={shareText}
            header={
                <Flex gap="32px" align="center" wrap className="EntityDetail__header">
                    <Avatar shape="circle" size={96} icon={<GlobalOutlined />} className="SyndicationDetail__avatar" />
                    <Flex vertical gap={12} className="EntityDetail__headerBody SyndicationDetail__headerCopy">
                        <div className="EntityDetail__titleBlock">
                            <Typography.Text className="EntityDetail__eyebrow">Syndication</Typography.Text>
                            <Typography.Title level={1} className="EntityDetail__title">
                                {title}
                            </Typography.Title>
                        </div>
                        <Flex wrap gap={8} className="SyndicationDetail__tagRow">
                            <Tag color={entry.enabled ? "success" : "default"}>
                                {entry.enabled ? "Enabled" : "Disabled"}
                            </Tag>
                            <Tag>{entry.name === "Main" ? "Primary endpoint" : "Syndicated endpoint"}</Tag>
                            {entry.nsfw ? <SyndicationNsfwTag className="SyndicationDetail__nsfwTag" /> : null}
                        </Flex>
                        {entry.nsfw ? (
                            <Typography.Text type="secondary" className="SyndicationDetail__nsfwNote">
                                You must be 18+ to see this content.
                            </Typography.Text>
                        ) : null}
                    </Flex>
                </Flex>
            }
            beforeShare={
                <>
                    <Flex wrap gap={12}>
                        <Button
                            type={entry.enabled ? "default" : "primary"}
                            size="large"
                            icon={<PoweroffOutlined />}
                            onClick={() =>
                                setUrls((current) => setEndpointEnabled(current, entry.value, !entry.enabled))
                            }
                        >
                            {entry.enabled ? "Disable URL" : "Enable URL"}
                        </Button>
                        <RouteButton to={routes.syndication.route} size="large">
                            Back to list
                        </RouteButton>
                    </Flex>
                    <Divider />
                    {entry.description && (
                        <>
                            <Markdown className="SyndicationDetail__description">{entry.description}</Markdown>
                            <Divider />
                        </>
                    )}
                </>
            }
            sections={[
                {
                    key: "meta",
                    children: (
                        <Descriptions bordered column={1} size="small" className="SyndicationDetail__meta">
                            <Descriptions.Item label="Name">{title}</Descriptions.Item>
                            <Descriptions.Item label="Host">{host}</Descriptions.Item>
                            <Descriptions.Item label="Backend URL">
                                <Typography.Link href={entry.value} target="_blank" rel="noreferrer">
                                    {entry.value}
                                </Typography.Link>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                {entry.enabled ? "Enabled in search and lists" : "Disabled locally"}
                            </Descriptions.Item>
                        </Descriptions>
                    ),
                },
            ]}
        />
    );
};

export default SyndicationDetail;
