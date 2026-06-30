import * as React from "react";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Flex, Form, Input, Space, Typography } from "antd";

export const ProductParametersField: React.FunctionComponent = () => {
    return (
        <Form.List name="parameters">
            {(fields, { add, remove }) => (
                <Card className="Publish__parametersCard">
                    <Flex vertical gap={8} className="Publish__parametersHeader">
                        <Flex justify="space-between" align="center" gap={12} wrap>
                            <Typography.Title level={5} className="Publish__parametersTitle">
                                Selectable properties
                            </Typography.Title>
                            <Button
                                type="default"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    add({
                                        name: "",
                                        values: [{ name: "", default: true }],
                                    });
                                }}
                            >
                                Add property
                            </Button>
                        </Flex>
                        <Typography.Paragraph className="Publish__parametersDescription">
                            Add selectable options like size or color. Each option can have multiple values and one
                            default.
                        </Typography.Paragraph>
                    </Flex>
                    <Space direction="vertical" size={16} className="Publish__parametersList">
                        {fields.map((field) => (
                            <Card key={field.key} className="Publish__parameterCard" size="small">
                                <Flex vertical gap={16}>
                                    <Form.Item name={[field.name, "id"]} hidden>
                                        <Input />
                                    </Form.Item>
                                    <Flex justify="space-between" align="start" gap={12} wrap>
                                        <Form.Item
                                            name={[field.name, "name"]}
                                            label="Property name"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Enter a property name",
                                                },
                                            ]}
                                            className="Publish__parameterNameField"
                                        >
                                            <Input placeholder="Size" />
                                        </Form.Item>
                                        <Button
                                            danger
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(field.name)}
                                            className="Publish__parameterRemoveButton"
                                        >
                                            Remove
                                        </Button>
                                    </Flex>
                                    <Space direction="vertical" size={12} className="Publish__parameterValues">
                                        <Typography.Text strong className="Publish__parameterValuesLabel">
                                            Values
                                        </Typography.Text>
                                        <Form.List name={[field.name, "values"]}>
                                            {(valueFields, valueOperations) => (
                                                <Space direction="vertical" size={12} className="Publish__parameterValuesList">
                                                    {valueFields.map((valueField) => (
                                                        <Card
                                                            key={valueField.key}
                                                            size="small"
                                                            className="Publish__parameterValueCard"
                                                        >
                                                            <Flex align="start" gap={12} wrap>
                                                                <Form.Item
                                                                    name={[valueField.name, "id"]}
                                                                    hidden
                                                                >
                                                                    <Input />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    name={[valueField.name, "name"]}
                                                                    label="Value name"
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: "Enter a value name",
                                                                        },
                                                                    ]}
                                                                    className="Publish__parameterValueNameField"
                                                                >
                                                                    <Input placeholder="XL" />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    name={[valueField.name, "default"]}
                                                                    valuePropName="checked"
                                                                    className="Publish__parameterValueDefaultField"
                                                                >
                                                                    <Checkbox>Default</Checkbox>
                                                                </Form.Item>
                                                                <Button
                                                                    danger
                                                                    type="text"
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => {
                                                                        valueOperations.remove(valueField.name);
                                                                    }}
                                                                    className="Publish__parameterValueRemoveButton"
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </Flex>
                                                            <Typography.Text type="secondary" className="Publish__parameterValueKey">
                                                                Key is generated from the value name automatically.
                                                            </Typography.Text>
                                                        </Card>
                                                    ))}
                                                    <Button
                                                        type="dashed"
                                                        icon={<PlusOutlined />}
                                                        onClick={() =>
                                                            valueOperations.add({
                                                                name: "",
                                                                default: (valueFields || []).length === 0,
                                                            })
                                                        }
                                                    >
                                                        Add value
                                                    </Button>
                                                </Space>
                                            )}
                                        </Form.List>
                                    </Space>
                                </Flex>
                            </Card>
                        ))}
                    </Space>
                </Card>
            )}
        </Form.List>
    );
};
