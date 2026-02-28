import React from "react";
import { Alert, Button, Form, Select, Space, Tag, Typography } from "antd";
import { CloudServerOutlined, SwapOutlined } from "@ant-design/icons";
import { URL } from "../../types";

export interface PublishServerSelectorProps {
    urls: URL[];
    onConfirm: (url: string) => void;
}

type PublishServerFormValues = {
    url: string;
};

export const PublishServerSelector: React.FunctionComponent<PublishServerSelectorProps> = ({
    urls,
    onConfirm,
}) => {
    const [form] = Form.useForm<PublishServerFormValues>();
    const selectedUrl = Form.useWatch("url", form);

    const selectedServer = urls.find((url) => url.value === selectedUrl);
    const onContinue = (values: PublishServerFormValues) => onConfirm(values.url);

    return (
        <div className="PublishServer">
            <Typography.Title level={2}>Select Server</Typography.Title>
            <Typography.Paragraph type="secondary">
                Choose which backend server to use before publishing.
            </Typography.Paragraph>

            {urls.length > 0 ? (
                <Form<PublishServerFormValues>
                    form={form}
                    layout="vertical"
                    className="PublishServer__form"
                    onFinish={onContinue}
                >
                    <Form.Item
                        label="Server URL"
                        name="url"
                        rules={[{ required: true, message: "Please select a server URL." }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Select a server"
                            options={urls.map((endpoint) => ({
                                value: endpoint.value,
                                label: endpoint.name?.trim()
                                    ? `${endpoint.name} (${endpoint.value})`
                                    : endpoint.value,
                            }))}
                        />
                    </Form.Item>

                    {selectedServer && (
                        <Space size={8} wrap className="PublishServer__summary">
                            <Tag color="blue" icon={<CloudServerOutlined />}>
                                {selectedServer.name?.trim() || selectedServer.value}
                            </Tag>
                            <Tag color={selectedServer.enabled ? "success" : "default"}>
                                {selectedServer.enabled ? "Enabled" : "Disabled"}
                            </Tag>
                            <Typography.Text className="PublishServer__url">{selectedServer.value}</Typography.Text>
                        </Space>
                    )}

                    <Button type="primary" size="large" icon={<SwapOutlined />} htmlType="submit">
                        Use selected server
                    </Button>
                </Form>
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
