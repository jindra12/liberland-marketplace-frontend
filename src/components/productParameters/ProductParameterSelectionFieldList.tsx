import * as React from "react";

import { Card, Flex, Form, Input, Select, Typography } from "antd";

import type { ProductParameterSource } from "./types";

type ProductParameterSelectionFieldListProps = {
    parameters?: ProductParameterSource[] | null;
};

export const ProductParameterSelectionFieldList: React.FunctionComponent<ProductParameterSelectionFieldListProps> = (
    props,
) => {
    const parameters = (props.parameters || []).filter(
        (parameter) => Boolean(parameter?.name) && (parameter.values || []).length > 0,
    );

    if (parameters.length === 0) {
        return null;
    }

    return (
        <Form.List name="parameters">
            {(fields) => (
                <Flex vertical gap={12} className="ProductParameterSelector__list">
                    {fields.map((field, index) => {
                        const parameter = parameters[index];

                        if (!parameter) {
                            return null;
                        }

                        return (
                            <Card key={field.key} className="ProductParameterSelector__card" size="small">
                                <Flex vertical gap={8}>
                                    <Form.Item name={[field.name, "id"]} hidden>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name={[field.name, "name"]} hidden>
                                        <Input />
                                    </Form.Item>
                                    <Typography.Text strong className="ProductParameterSelector__label">
                                        {parameter.name}
                                    </Typography.Text>
                                    <Form.Item
                                        name={[field.name, "selectedValue"]}
                                        className="ProductParameterSelector__field"
                                    >
                                        <Select
                                            className="ProductParameterSelector__select"
                                            options={(parameter.values || [])
                                                .filter((value) => Boolean(value?.name))
                                                .map((value) => ({
                                                    value: value?.key || value?.name || "",
                                                    label: value?.name || "",
                                                }))}
                                        />
                                    </Form.Item>
                                </Flex>
                            </Card>
                        );
                    })}
                </Flex>
            )}
        </Form.List>
    );
};
