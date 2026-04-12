import * as React from "react";

import { useParams } from "react-router-dom";

import { GlobalOutlined, PoweroffOutlined } from "@ant-design/icons";
import { Avatar, Button, Descriptions, Divider, Flex, Result, Tag, Typography } from "antd";

import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { useEndpointContext } from "../EndpointContext";
import { getSyndicationHost, getSyndicationName, setEndpointEnabled } from "../endpoints/utils";
import { DetailPageSkeleton } from "../LoadingSkeleton/DetailPageSkeleton";
import { Markdown } from "../Markdown";
import { RouteButton } from "../RouteButton";
import { DetailShareSection } from "../share/DetailShareSection";

import { DetailBackButton } from "./DetailBackButton";

const SyndicationDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { urls, setUrls } = useEndpointContext();

    const decodedUrl = React.useMemo(() => {
        if (!id) {
            return "";
        }

        try {
            return decodeURIComponent(id);
        } catch {
            return "";
        }
    }, [id]);

    const entry = React.useMemo(() => urls.find((current) => current.value === decodedUrl), [decodedUrl, urls]);

    if (!entry) {
        return <DetailPageSkeleton />;
    }

    if (!entry) {
        return (
            <Result
                status="404"
                title="Syndicated URL not found"
                subTitle="This syndicated URL is not available in your current marketplace context."
                extra={
                    <RouteButton to="/syndication" type="primary">
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
        <Flex flex={1} vertical gap={12} className="EntityDetail SyndicationDetail">
            <DetailPageTracker serverUrl={entry.value} />
            <DetailBackButton to="/syndication" label="Back to syndication" />
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
                    </Flex>
                </Flex>
            </Flex>
            <Flex wrap gap={12}>
                <Button
                    type={entry.enabled ? "default" : "primary"}
                    size="large"
                    icon={<PoweroffOutlined />}
                    onClick={() => setUrls((current) => setEndpointEnabled(current, entry.value, !entry.enabled))}
                >
                    {entry.enabled ? "Disable URL" : "Enable URL"}
                </Button>
                <Button type="primary" size="large" href={entry.value} target="_blank" rel="noreferrer">
                    Visit URL
                </Button>
                <RouteButton to="/syndication" size="large">
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
            <DetailShareSection label="Share this endpoint" title={title} text={shareText} />
            <Divider />
            <Descriptions bordered column={1} size="small" className="SyndicationDetail__meta">
                <Descriptions.Item label="Name">{title}</Descriptions.Item>
                <Descriptions.Item label="Host">{host}</Descriptions.Item>
                <Descriptions.Item label="URL">
                    <Typography.Link href={entry.value} target="_blank" rel="noreferrer">
                        {entry.value}
                    </Typography.Link>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    {entry.enabled ? "Enabled in search and lists" : "Disabled locally"}
                </Descriptions.Item>
            </Descriptions>
        </Flex>
    );
};

export default SyndicationDetail;
