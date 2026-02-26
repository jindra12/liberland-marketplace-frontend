import React from "react";
import { Alert, Button, Card, Flex, Space, Tag, Typography } from "antd";
import { CheckCircleOutlined, CloudServerOutlined, SwapOutlined } from "@ant-design/icons";
import { URL as EndpointUrl } from "../EndpointContext";

export interface PublishServerSelectorProps {
    urls: EndpointUrl[];
    authUrl: string;
    onConfirm: (url: string) => void;
}

export const PublishServerSelector: React.FunctionComponent<PublishServerSelectorProps> = ({
    urls,
    authUrl,
    onConfirm,
}) => {
    const [selectedUrl, setSelectedUrl] = React.useState<string>(authUrl);

    React.useEffect(() => {
        if (urls.length === 0) {
            setSelectedUrl("");
            return;
        }

        if (!urls.some((url) => url.value === selectedUrl)) {
            const fallback = urls.find((url) => url.value === authUrl)?.value || urls[0].value;
            setSelectedUrl(fallback);
        }
    }, [urls, selectedUrl, authUrl]);

    const onContinue = () => {
        if (!selectedUrl) return;
        onConfirm(selectedUrl);
    };

    return (
        <div className="PublishServer">
            <Typography.Title level={2}>Select Server</Typography.Title>
            <Typography.Paragraph type="secondary">
                Choose which backend server to use before publishing.
            </Typography.Paragraph>

            {urls.length > 0 ? (
                <Space direction="vertical" size={14} className="PublishServer__list">
                    {urls.map((endpoint) => {
                        const isSelected = selectedUrl === endpoint.value;
                        return (
                            <Card
                                key={endpoint.value}
                                hoverable
                                className={`PublishServer__card${isSelected ? " PublishServer__card--selected" : ""}`}
                                onClick={() => setSelectedUrl(endpoint.value)}
                            >
                                <Flex align="center" justify="space-between" gap={12} wrap>
                                    <Flex align="center" gap={12}>
                                        <CloudServerOutlined className="PublishServer__icon" />
                                        <Typography.Text className="PublishServer__url">{endpoint.value}</Typography.Text>
                                    </Flex>
                                    <Space size={8}>
                                        <Tag color={endpoint.enabled ? "success" : "default"}>
                                            {endpoint.enabled ? "Enabled" : "Disabled"}
                                        </Tag>
                                        {isSelected && (
                                            <Tag color="blue" icon={<CheckCircleOutlined />}>
                                                Selected
                                            </Tag>
                                        )}
                                    </Space>
                                </Flex>
                            </Card>
                        );
                    })}
                    <Button
                        type="primary"
                        size="large"
                        icon={<SwapOutlined />}
                        disabled={!selectedUrl}
                        onClick={onContinue}
                    >
                        Use selected server
                    </Button>
                </Space>
            ) : (
                <Alert
                    showIcon
                    type="warning"
                    message="No servers configured"
                    description="Add at least one endpoint from the server settings icon in the header."
                />
            )}
        </div>
    );
};
