import * as React from "react";
import {
    Alert,
    Button,
    Drawer,
    Form,
    Input,
    List,
    Popconfirm,
    Switch,
    Tag,
    Typography,
} from "antd";
import { DeleteOutlined, GlobalOutlined, LinkOutlined, PlusOutlined } from "@ant-design/icons";
import { useEndpointContext } from "./EndpointContext";

type AddEndpointValues = {
    url: string;
    name: string;
};

export const EndpointDrawerButton: React.FunctionComponent = () => {
    const { urls, enabled, setUrls } = useEndpointContext();
    const [open, setOpen] = React.useState(false);
    const [form] = Form.useForm<AddEndpointValues>();

    const addEndpoint = (values: AddEndpointValues) => {
        const parsed = new window.URL(values.url.trim());
        parsed.hash = "";
        parsed.search = "";
        const normalized = parsed.toString().replace(/\/+$/, "");

        setUrls((current) => [...current, { value: normalized, name: values.name, enabled: true }]);

        form.resetFields();
    };

    const toggleEndpoint = (value: string, endpointEnabled: boolean) => {
        setUrls((current) =>
            current.map((endpoint) =>
                endpoint.value === value ? { ...endpoint, enabled: endpointEnabled } : endpoint,
            ),
        );
    };

    const removeEndpoint = (value: string) => {
        setUrls((current) => current.filter((endpoint) => endpoint.value !== value));
    };

    return (
        <>
            <Button
                type="text"
                aria-label="Manage endpoints"
                icon={<GlobalOutlined />}
                onClick={(event) => {
                    event.preventDefault();
                    setOpen(true);
                }}
            />
            <Drawer
                title="Data Endpoints"
                placement="right"
                width={480}
                open={open}
                onClose={() => setOpen(false)}
                extra={<Tag color={enabled.length ? "success" : "warning"}>{enabled.length} enabled</Tag>}
            >
                <Typography.Paragraph type="secondary">
                    Add any compatible backend URL, toggle it on or off, or remove it.
                </Typography.Paragraph>

                <Form<AddEndpointValues>
                    form={form}
                    layout="inline"
                    onFinish={addEndpoint}
                    style={{ marginBottom: 16, width: "100%" }}
                >
                    <Form.Item
                        name="url"
                        style={{ flex: 1, marginRight: 8, marginBottom: 8 }}
                        rules={[
                            { required: true, message: "URL is required." },
                            {
                                validator: async (_, value?: string) => {
                                    if (!value?.trim()) {
                                        return;
                                    }

                                    try {
                                        const parsed = new window.URL(value.trim());
                                        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                                            throw new Error("invalid protocol");
                                        }

                                        parsed.hash = "";
                                        parsed.search = "";
                                        const normalized = parsed.toString().replace(/\/+$/, "");
                                        if (urls.some((endpoint) => endpoint.value === normalized)) {
                                            throw new Error("duplicate");
                                        }
                                    } catch (error) {
                                        const reason = error instanceof Error ? error.message : "";
                                        if (reason === "duplicate") {
                                            throw new Error("This URL already exists.");
                                        }
                                        throw new Error("Please enter a valid http(s) URL.");
                                    }
                                },
                            },
                        ]}
                    >
                        <Input
                            prefix={<LinkOutlined />}
                            placeholder="https://your-backend.example"
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 8 }}>
                        <Button type="primary" icon={<PlusOutlined />} htmlType="submit">
                            Add
                        </Button>
                    </Form.Item>
                </Form>

                {enabled.length === 0 && (
                    <Alert
                        showIcon
                        type="warning"
                        message="No endpoints are enabled. Query results will be empty."
                        style={{ marginBottom: 16 }}
                    />
                )}
                <List
                    bordered
                    dataSource={urls}
                    locale={{ emptyText: "No endpoints configured yet." }}
                    renderItem={(endpoint) => (
                        <List.Item
                            actions={[
                                <Switch
                                    key={`switch-${endpoint.value}`}
                                    checked={endpoint.enabled}
                                    checkedChildren="On"
                                    unCheckedChildren="Off"
                                    onChange={(checked) => toggleEndpoint(endpoint.value, checked)}
                                />,
                                <Popconfirm
                                    key={`delete-${endpoint.value}`}
                                    title="Remove endpoint?"
                                    description={endpoint.value}
                                    okText="Remove"
                                    cancelText="Cancel"
                                    onConfirm={() => removeEndpoint(endpoint.value)}
                                >
                                    <Button danger icon={<DeleteOutlined />} />
                                </Popconfirm>,
                            ]}
                        >
                            <List.Item.Meta title={endpoint.value} />
                        </List.Item>
                    )}
                />
            </Drawer>
        </>
    );
};
