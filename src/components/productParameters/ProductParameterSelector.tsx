import * as React from "react";

import { Card, Flex, Select, Typography } from "antd";

import type { ProductParameterSelectionMap, ProductParameterSource } from "./types";
import { buildProductParameterSelectionMap } from "./utils";

type ProductParameterSelectorProps = {
    parameters?: ProductParameterSource[] | null;
    value: ProductParameterSelectionMap;
    onChange: (next: ProductParameterSelectionMap) => void;
};

export const ProductParameterSelector: React.FunctionComponent<ProductParameterSelectorProps> = (props) => {
    const parameters = (props.parameters || []).filter(
        (parameter) => Boolean(parameter?.name) && (parameter.values || []).length > 0,
    );

    if (parameters.length === 0) {
        return null;
    }

    const initialSelection = buildProductParameterSelectionMap(parameters);

    return (
        <Card className="ProductParameterSelector">
            <Flex vertical gap={12} className="ProductParameterSelector__content">
                <Typography.Text strong className="ProductParameterSelector__title">
                    Choose options
                </Typography.Text>
                <Flex vertical gap={12} className="ProductParameterSelector__list">
                    {parameters.map((parameter) => (
                        <Flex vertical gap={6} key={parameter.name} className="ProductParameterSelector__item">
                            <Typography.Text strong className="ProductParameterSelector__label">
                                {parameter.name}
                            </Typography.Text>
                            {(() => {
                                const currentValue = props.value[parameter.name || ""] ?? initialSelection[parameter.name || ""];

                                return (
                                    <Select
                                        className="ProductParameterSelector__select"
                                        value={currentValue}
                                        options={(parameter.values || [])
                                            .filter((value) => Boolean(value?.name))
                                            .map((value) => ({
                                                value: value?.key || value?.name || "",
                                                label: value?.name || "",
                                            }))}
                                        onChange={(nextValue) => {
                                            props.onChange({
                                                ...props.value,
                                                [parameter.name || ""]: nextValue,
                                            });
                                        }}
                                    />
                                );
                            })()}
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </Card>
    );
};
