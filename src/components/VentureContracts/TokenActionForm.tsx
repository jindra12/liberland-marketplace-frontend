import * as React from "react";

import { Button, Checkbox, Form, Input } from "antd";
import { isAddress } from "ethers";

import type { TokenActionFormProps } from "./types";

export const TokenActionForm: React.FunctionComponent<TokenActionFormProps> = (props) => (
    <Form layout="vertical" onFinish={props.onSubmit} disabled={props.busy}>
        {(props.action === "transfer" || props.action === "delegate") && (
            <Form.Item
                name="address"
                label={props.action === "transfer" ? "Recipient" : "Delegate address"}
                rules={[
                    { required: true },
                    {
                        validator: async (_rule, value: string) => {
                            if (!isAddress(value)) {
                                throw new Error("Enter a valid Ethereum address.");
                            }
                        },
                    },
                ]}
            >
                <Input />
            </Form.Item>
        )}
        {props.action !== "delegate" && props.action !== "claim" && (
            <Form.Item
                name="amount"
                label="Amount"
                rules={[
                    { required: true },
                    {
                        pattern: /^(?:[1-9]\d*|0)(?:\.\d{1,18})?$/,
                        message: "Enter a token amount with at most 18 decimals.",
                    },
                    {
                        validator: async (_rule, value: string) => {
                            if (Number(value) <= 0) {
                                throw new Error("Amount must be positive.");
                            }
                        },
                    },
                ]}
            >
                <Input inputMode="decimal" />
            </Form.Item>
        )}
        {props.action === "redeem" && (
            <Form.Item
                name="minimum"
                label="Minimum underlying token payout"
                rules={[
                    { required: true },
                    { pattern: /^\d+(?:\.\d{1,18})?$/, message: "Enter a non-negative amount." },
                ]}
            >
                <Input inputMode="decimal" />
            </Form.Item>
        )}
        {props.action === "root" && (
            <Form.Item
                name="acknowledged"
                valuePropName="checked"
                rules={[
                    {
                        validator: async (_rule, checked: boolean) => {
                            if (!checked) {
                                throw new Error("Confirm that only DAO governance can unroot your tokens.");
                            }
                        },
                    },
                ]}
            >
                <Checkbox>I understand only a DAO vote can make these tokens transferable again.</Checkbox>
            </Form.Item>
        )}
        <Button htmlType="submit" type="primary" loading={props.busy}>
            {
                {
                    root: "Root tokens",
                    delegate: "Delegate voting power",
                    transfer: "Transfer tokens",
                    claim: "Claim 30-day reward",
                    redeem: "Redeem reward tokens",
                }[props.action]
            }
        </Button>
    </Form>
);
