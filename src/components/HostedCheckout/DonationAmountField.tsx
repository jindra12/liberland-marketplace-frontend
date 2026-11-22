import * as React from "react";

import { Form, InputNumber, Radio, Typography } from "antd";

import { DONATION_AMOUNTS } from "./constants";

export const DonationAmountField: React.FunctionComponent = () => {
    const form = Form.useFormInstance();
    const preset = Form.useWatch<number | "custom">("donationPreset", form);

    return (
        <>
            <Form.Item name="donationPreset" label="Choose a one-time amount" initialValue={10}>
                <Radio.Group
                    className="DonationAmount__presets"
                    optionType="button"
                    options={[
                        ...DONATION_AMOUNTS.map((amount) => ({ label: `$${amount}`, value: amount })),
                        { label: "Custom", value: "custom" },
                    ]}
                    onChange={(event) => {
                        if (typeof event.target.value === "number") {
                            form.setFieldValue("amount", event.target.value);
                        }
                    }}
                />
            </Form.Item>
            <Form.Item
                name="amount"
                label="Donation amount (USD)"
                hidden={preset !== "custom"}
                rules={[{ required: true, type: "number", min: 1, max: 1_000_000 }]}
            >
                <InputNumber min={1} max={1_000_000} precision={2} prefix="$" />
            </Form.Item>
            <Typography.Paragraph type="secondary">
                One-time donation in USD. No recurring charges.
            </Typography.Paragraph>
        </>
    );
};
