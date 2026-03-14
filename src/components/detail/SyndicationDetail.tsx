import * as React from "react";
import { useIsFetching } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Descriptions, Divider, Flex, Result, Tag, Typography } from "antd";
import { GlobalOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useEndpointContext } from "../EndpointContext";
import { DetailPageSkeleton } from "../LoadingSkeleton/DetailPageSkeleton";
import { useListPublishedSyndicationUrlsQuery } from "../../generated/graphql";
import { getSyndicationHost, getSyndicationName, setEndpointEnabled } from "../../utils";
import { Markdown } from "../Markdown";

const SyndicationDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { urls, setUrls } = useEndpointContext();
    const syndicationLoading = useIsFetching({ queryKey: useListPublishedSyndicationUrlsQuery.getKey({}) }) > 0;

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

    const entry = React.useMemo(
        () => urls.find((current) => current.value === decodedUrl),
        [decodedUrl, urls],
    );

    if (syndicationLoading && !entry) {
        return <DetailPageSkeleton />;
    }

    if (!entry) {
        return (
            <Result
                status="404"
                title="Syndicated URL not found"
                subTitle="This syndicated URL is not available in your current marketplace context."
                extra={(
                    <Link to="/syndication">
                        <Button type="primary">Back to syndication</Button>
                    </Link>
                )}
            />
        );
    }

    const host = getSyndicationHost(entry.value);
    const title = getSyndicationName(entry);

    return (
        <Flex flex={1} vertical gap={12}>
            <Flex gap="32px" align="center" wrap className="EntityDetail__header">
                <Avatar
                    shape="circle"
                    size={96}
                    icon={<GlobalOutlined />}
                    className="SyndicationDetail__avatar"
                />
                <Flex vertical gap={12} className="EntityDetail__headerBody SyndicationDetail__headerCopy">
                    <div className="EntityDetail__titleBlock">
                        <Typography.Text className="EntityDetail__eyebrow">
                            Syndication
                        </Typography.Text>
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
                <Link to="/syndication">
                    <Button size="large">Back to list</Button>
                </Link>
            </Flex>
            <Divider />
            {entry.description && (
                <>
                    <Markdown className="SyndicationDetail__description">
                        {entry.description}
                    </Markdown>
                    <Divider />
                </>
            )}
            <Descriptions bordered column={1} size="small" className="SyndicationDetail__meta">
                <Descriptions.Item label="Name">
                    {title}
                </Descriptions.Item>
                <Descriptions.Item label="Host">
                    {host}
                </Descriptions.Item>
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
