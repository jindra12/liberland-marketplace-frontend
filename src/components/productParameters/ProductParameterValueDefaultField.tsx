import * as React from "react";

import { Checkbox, Form } from "antd";

import { buildProductParameterValuesWithSingleDefault } from "./utils";

type ProductParameterValueDefaultFieldProps = {
    parameterIndex: number;
    valueIndex: number;
};

export const ProductParameterValueDefaultField: React.FunctionComponent<ProductParameterValueDefaultFieldProps> = (
    props,
) => {
    const form = Form.useFormInstance();

    return (
        <Form.Item
            name={[props.valueIndex, "default"]}
            valuePropName="checked"
            className="Publish__parameterValueDefaultField"
        >
            <Checkbox
                onChange={(event) => {
                    const nextValues = buildProductParameterValuesWithSingleDefault(
                        form.getFieldValue(["parameters", props.parameterIndex, "values"]),
                        props.valueIndex,
                        event.target.checked,
                    );

                    nextValues.forEach((value, index) => {
                        form.setFieldValue(
                            ["parameters", props.parameterIndex, "values", index, "default"],
                            value.default,
                        );
                    });
                }}
            >
                Default
            </Checkbox>
        </Form.Item>
    );
};
