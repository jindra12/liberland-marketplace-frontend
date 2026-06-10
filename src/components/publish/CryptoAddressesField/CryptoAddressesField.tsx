import * as React from "react";

import { Card, Form, Input, Select, Space, Typography } from "antd";

import { CRYPTO_ADDRESS_CHAIN_OPTIONS } from "./constants";
import { validateCryptoAddress } from "./utils";

export interface CryptoAddressesFieldProps {
    description?: string;
    label?: string;
}

export const CryptoAddressesField: React.FunctionComponent<CryptoAddressesFieldProps> = (props) => {
    const form = Form.useFormInstance();

    return (
        <Card className="Publish__cryptoCard">
            <Space direction="vertical" size={12} className="Publish__cryptoCardHeader">
                <Typography.Title level={5} className="Publish__cryptoCardTitle">
                    {props.label ?? "Payment wallet"}
                </Typography.Title>
                <Typography.Paragraph className="Publish__cryptoCardDescription">
                    {props.description ??
                        "Add the chain and address buyers should use at checkout. Product wallets take priority over company wallets."}
                </Typography.Paragraph>
            </Space>
            <Space direction="vertical" size={16} className="Publish__cryptoFieldGroup">
                <Form.Item name={["cryptoAddresses", "chain"]} label="Wallet chain" className="Publish__cryptoChainField">
                    <Select allowClear options={CRYPTO_ADDRESS_CHAIN_OPTIONS} placeholder="Select a wallet chain" />
                </Form.Item>
                <Form.Item
                    name={["cryptoAddresses", "address"]}
                    label="Wallet address"
                    dependencies={[["cryptoAddresses", "chain"]]}
                    rules={[
                        {
                            validator: async (_, value: string | null | undefined) => {
                                const result = validateCryptoAddress(
                                    form.getFieldValue(["cryptoAddresses", "chain"]),
                                    value,
                                );

                                if (result !== true) {
                                    throw new Error(result);
                                }
                            },
                        },
                    ]}
                    className="Publish__cryptoAddressField"
                >
                    <Input placeholder="Enter wallet address" />
                </Form.Item>
            </Space>
        </Card>
    );
};
