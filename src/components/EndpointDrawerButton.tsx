import * as React from "react";
import {
    Alert,
    Button,
    Drawer,
    Form,
    Input,
    List,
    Switch,
    Tag,
    Typography,
} from "antd";
import type { ButtonProps } from "antd";
import { DownOutlined, GlobalOutlined, LinkOutlined, PlusOutlined, UpOutlined } from "@ant-design/icons";
import { useEndpointContext } from "./EndpointContext";

type AddEndpointValues = {
    url: string;
    name: string;
};

type EndpointDrawerButtonProps = {
    type?: ButtonProps["type"];
    block?: boolean;
    className?: string;
    children?: React.ReactNode;
};

export const EndpointDrawerButton: React.FunctionComponent<EndpointDrawerButtonProps> = ({
    type = "text",
    block,
    className,
    children,
}) => {
    const { urls, enabled, setUrls } = useEndpointContext();
    const [open, setOpen] = React.useState(false);
    const [form] = Form.useForm<AddEndpointValues>();

    const addEndpoint = (values: AddEndpointValues) => {
        const parsed = new window.URL(values.url.trim());
        parsed.hash = "";
        parsed.search = "";
        const normalized = parsed.toString().replace(/\/+$/, "");

        setUrls((current) => [...current || [], { value: normalized, name: values.name, enabled: true }]);

        form.resetFields();
    };

    const toggleEndpoint = (value: string, endpointEnabled: boolean) => {
        setUrls((current) =>
            current?.map((endpoint) =>
                endpoint.value === value ? { ...endpoint, enabled: endpointEnabled } : endpoint,
            ) || [],
        );
    };

    const moveEndpoint = (index: number, direction: -1 | 1) => {
        setUrls((current) => {
            const nextIndex = index + direction;
            if (!current || index < 0 || nextIndex < 0 || index >= current.length || nextIndex >= current.length) {
                return current || [];
            }

            const reordered = [...current];
            const [item] = reordered.splice(index, 1);
            reordered.splice(nextIndex, 0, item);
            return reordered;
        });
    };

    return (
        <>
            <Button
                type={type}
                block={block}
                className={className}
                aria-label="Manage endpoints"
                icon={<GlobalOutlined />}
                onClick={(event) => {
                    event.preventDefault();
                    setOpen(true);
                }}
            >
                {children}
            </Button>
            <Drawer
                title="Data Endpoints"
                placement="right"
                width={480}
                open={open}
                onClose={() => setOpen(false)}
                extra={<Tag color={enabled.length ? "success" : "warning"}>{enabled.length} enabled</Tag>}
            >
                <Typography.Paragraph type="secondary">
                    Add any compatible backend URL, reorder it with arrows, and toggle it on or off.
                </Typography.Paragraph>

                <Form<AddEndpointValues>
                    form={form}
                    layout="inline"
                    onFinish={addEndpoint}
                    className="EndpointDrawerButton__form"
                >
                    <Form.Item
                        name="url"
                        className="EndpointDrawerButton__urlItem"
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
                    <Form.Item className="EndpointDrawerButton__submitItem">
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
                        className="EndpointDrawerButton__warning"
                    />
                )}
                <List
                    bordered
                    dataSource={urls}
                    locale={{ emptyText: "No endpoints configured yet." }}
                    renderItem={(endpoint, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    key={`up-${endpoint.value}`}
                                    type="text"
                                    icon={<UpOutlined />}
                                    aria-label={`Move ${endpoint.value} up`}
                                    disabled={index === 0}
                                    onClick={() => moveEndpoint(index, -1)}
                                />,
                                <Button
                                    key={`down-${endpoint.value}`}
                                    type="text"
                                    icon={<DownOutlined />}
                                    aria-label={`Move ${endpoint.value} down`}
                                    disabled={index === urls.length - 1}
                                    onClick={() => moveEndpoint(index, 1)}
                                />,
                                <Switch
                                    key={`switch-${endpoint.value}`}
                                    checked={endpoint.enabled}
                                    checkedChildren="On"
                                    unCheckedChildren="Off"
                                    onChange={(checked) => toggleEndpoint(endpoint.value, checked)}
                                />,
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
