import React from "react";
import { Alert, Button, Card, Flex, Tag, Typography } from "antd";
import { ArrowRightOutlined, CheckCircleFilled, CloudServerOutlined } from "@ant-design/icons";
import { URL } from "../../types";
import { getSyndicationHost, getSyndicationName } from "../endpoints/utils";
export interface PublishServerSelectorProps {
    urls: URL[];
    onConfirm: (url: string) => void;
}
export const PublishServerSelector: React.FunctionComponent<PublishServerSelectorProps> = (props) => {
    const items = React.useMemo(
        () =>
            [...props.urls].sort((left, right) => {
                if (left.name === "Main" && right.name !== "Main") {
                    return -1;
                }
                if (right.name === "Main" && left.name !== "Main") {
                    return 1;
                }
                if (left.enabled !== right.enabled) {
                    return left.enabled ? -1 : 1;
                }
                return getSyndicationName(left).localeCompare(getSyndicationName(right), "en", {
                    sensitivity: "base",
                });
            }),
        [props.urls],
    );
    const [selectedUrl, setSelectedUrl] = React.useState<string>();
    React.useEffect(() => {
        if (!items.length) {
            setSelectedUrl(undefined);
            return;
        }
        if (!selectedUrl || !items.some((entry) => entry.value === selectedUrl)) {
            setSelectedUrl(items[0].value);
        }
    }, [items, selectedUrl]);
    const selectedServer = items.find((entry) => entry.value === selectedUrl);
    return (
        <div className="PublishServer">
            <Typography.Title level={2}>Choose where to publish</Typography.Title>
            <Typography.Paragraph type="secondary">Pick the marketplace endpoint that should receive this listing.</Typography.Paragraph>

            {items.length > 0 ? (
                <>
                    <div className="PublishServer__list">
                        {items.map((endpoint) => {
                            const isSelected = endpoint.value === selectedUrl;
                            const description = endpoint.description || "Publish through this syndicated marketplace endpoint.";
                            return (
                                <Card
                                    key={endpoint.value}
                                    hoverable
                                    role="button"
                                    tabIndex={0}
                                    className={`PublishServer__card${isSelected ? " PublishServer__card--selected" : ""}`}
                                    onClick={() => setSelectedUrl(endpoint.value)}
                                    onKeyDown={(event) => {
                                        if (event.key !== "Enter" && event.key !== " ") {
                                            return;
                                        }
                                        event.preventDefault();
                                        setSelectedUrl(endpoint.value);
                                    }}
                                >
                                    <Flex justify="space-between" align="flex-start" gap={20} wrap className="PublishServer__cardRow">
                                        <Flex vertical gap={14} className="PublishServer__cardContent">
                                            <Flex align="center" gap={10} wrap className="PublishServer__cardHeader">
                                                <CloudServerOutlined className="PublishServer__icon" />
                                                <Typography.Title level={4} className="PublishServer__cardTitle">
                                                    {getSyndicationName(endpoint)}
                                                </Typography.Title>
                                                {endpoint.name === "Main" && <Tag color="blue">Main</Tag>}
                                                <Tag color={endpoint.enabled ? "success" : "default"}>{endpoint.enabled ? "Enabled" : "Disabled"}</Tag>
                                            </Flex>
                                            <Typography.Text className="PublishServer__host">{getSyndicationHost(endpoint.value)}</Typography.Text>
                                            <Typography.Paragraph className="PublishServer__description">{description}</Typography.Paragraph>
                                            <div className="PublishServer__urlBlock">
                                                <Typography.Text type="secondary">Endpoint URL</Typography.Text>
                                                <Typography.Text className="PublishServer__url">{endpoint.value}</Typography.Text>
                                            </div>
                                        </Flex>
                                        <div className="PublishServer__choice">
                                            {isSelected ? (
                                                <>
                                                    <CheckCircleFilled className="PublishServer__check" />
                                                    <span>Selected</span>
                                                </>
                                            ) : (
                                                <span>Choose endpoint</span>
                                            )}
                                        </div>
                                    </Flex>
                                </Card>
                            );
                        })}
                    </div>

                    {selectedServer && (
                        <Flex justify="space-between" align="center" gap={16} wrap className="PublishServer__summary">
                            <Flex vertical gap={4} className="PublishServer__summaryCopy">
                                <Typography.Text strong>Publishing to {getSyndicationName(selectedServer)}</Typography.Text>
                                <Typography.Text type="secondary">{getSyndicationHost(selectedServer.value)}</Typography.Text>
                                <Typography.Text className="PublishServer__url">{selectedServer.value}</Typography.Text>
                            </Flex>
                            <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => props.onConfirm(selectedServer.value)}>
                                Continue to publish
                            </Button>
                        </Flex>
                    )}
                </>
            ) : (
                <Alert showIcon type="warning" message="No endpoints configured" description="Add at least one syndicated marketplace URL from the header settings before publishing." />
            )}
        </div>
    );
};
