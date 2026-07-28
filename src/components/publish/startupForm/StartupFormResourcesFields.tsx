import * as React from "react";

import { Form, Input, InputNumber, Select } from "antd";

import { currencyOptions } from "../constants";

import {
    startupAlreadyHaveOptions,
    startupLookingForOptions,
    startupStageOptions,
} from "./constants";

export const StartupFormResourcesFields: React.FunctionComponent = () => {
    return (
        <>
            <Form.Item
                name="stage"
                label="Stage"
                rules={[
                    {
                        required: true,
                    },
                ]}
                className="Publish__startupStageField"
            >
                <Select options={startupStageOptions} />
            </Form.Item>
            <Form.Item name="lookingFor" label="Looking For" className="Publish__startupLookingForField">
                <Select
                    mode="multiple"
                    placeholder="Select resources you need"
                    options={startupLookingForOptions}
                    allowClear
                />
            </Form.Item>
            <Form.Item name="alreadyHave" label="Already Have" className="Publish__startupAlreadyHaveField">
                <Select
                    mode="multiple"
                    placeholder="Select resources you already have"
                    options={startupAlreadyHaveOptions}
                    allowClear
                />
            </Form.Item>
            <Form.Item label="Funds Needed" className="Publish__startupFundsField">
                <Input.Group compact>
                    <Form.Item name="fundsNeededAmount" noStyle>
                        <InputNumber placeholder="Amount" className="Publish__amountInput" />
                    </Form.Item>
                    <Form.Item name="fundsNeededCurrency" noStyle>
                        <Select
                            placeholder="Currency"
                            options={currencyOptions}
                            className="Publish__currencySelect"
                            allowClear
                        />
                    </Form.Item>
                </Input.Group>
            </Form.Item>
        </>
    );
};
