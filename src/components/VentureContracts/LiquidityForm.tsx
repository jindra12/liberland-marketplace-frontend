import * as React from "react";

import { useMutation } from "@tanstack/react-query";

import { Alert, Button, Flex, Form, Input, InputNumber, Select, Typography } from "antd";

import { validatePositiveAmount } from "./marketUtils";
import type { LiquidityValues, LiquidityFormProps } from "./types";

export const LiquidityForm: React.FunctionComponent<LiquidityFormProps> = (props) => {
    const [form] = Form.useForm<LiquidityValues>();
    const mutation = useMutation({ mutationFn: props.onSubmit, onError: (error) => console.error(error) });
    return (
        <Form
            form={form}
            layout="vertical"
            className="VentureContracts__form"
            initialValues={{ action: "mint", slippage: 0.5 }}
            onFinish={(values) => mutation.mutate(values)}
        >
            <Form.Item name="action" label="Liquidity action">
                <Select
                    options={[
                        { value: "mint", label: "Add full-range liquidity" },
                        { value: "inspect", label: "Inspect my position" },
                        { value: "withdraw", label: "Withdraw liquidity" },
                        { value: "collect", label: "Collect position fees" },
                        { value: "close", label: "Close empty position" },
                    ]}
                />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(previous, next) => previous.action !== next.action}>
                {() =>
                    form.getFieldValue("action") === "mint" ? (
                        <>
                            <Form.Item
                                name="ethAmount"
                                label="Maximum ETH deposit"
                                rules={[{ validator: validatePositiveAmount }, { max: 100 }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="tokenAmount"
                                label="Maximum token deposit"
                                rules={[{ validator: validatePositiveAmount }, { max: 100 }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item name="slippage" label="Liquidity slippage (%)" rules={[{ required: true }]}>
                                <InputNumber min={0.01} max={10} />
                            </Form.Item>
                            <Alert
                                className="VentureContracts__liquidity-notice"
                                type="info"
                                message="Unused ETH is refunded. Deposits use live Uniswap pricing, your maximum amounts, and the selected slippage limit."
                            />
                        </>
                    ) : (
                        <>
                            <Form.Item
                                name="tokenId"
                                label="Position receipt ID"
                                rules={[
                                    { required: true },
                                    { pattern: /^\d+$/, message: "Enter a whole position ID." },
                                    { max: 100 },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            {form.getFieldValue("action") === "withdraw" && (
                                <>
                                    <Form.Item
                                        name="liquidity"
                                        label="Liquidity units to withdraw"
                                        rules={[
                                            { required: true },
                                            { pattern: /^[1-9]\d*$/, message: "Enter positive whole liquidity units." },
                                            { max: 100 },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        name="minimumEth"
                                        label="Minimum ETH received"
                                        rules={[{ validator: validatePositiveAmount }, { max: 100 }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        name="minimumTokens"
                                        label="Minimum tokens received"
                                        rules={[{ validator: validatePositiveAmount }, { max: 100 }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Typography.Paragraph>
                                        Withdrawal reverts if either minimum is not met. Liquidity units are not token
                                        amounts; inspect your position first to see its available liquidity units.
                                    </Typography.Paragraph>
                                </>
                            )}
                        </>
                    )
                }
            </Form.Item>
            <Flex vertical gap={12}>
                {mutation.error && <Alert type="error" showIcon message={mutation.error.message} />}
                {mutation.data && <Alert type="success" showIcon message={mutation.data} />}
                <Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={!props.connected}>
                    {props.connected ? "Submit liquidity transaction" : "Connect wallet to manage liquidity"}
                </Button>
            </Flex>
        </Form>
    );
};
