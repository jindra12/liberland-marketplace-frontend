import * as React from "react";

import { Alert, Button, Flex, Form, Input, InputNumber, Select, Statistic, Typography } from "antd";
import { formatUnits, parseUnits } from "ethers";

import { validatePositiveAmount } from "./marketUtils";
import type { TradeFormProps, TradeValues } from "./types";
import { useTradeFlow } from "./useTradeFlow";

export const TradeForm: React.FunctionComponent<TradeFormProps> = (props) => {
    const [form] = Form.useForm<TradeValues>();
    const model = useTradeFlow(props, form);
    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ side: "buy", slippage: 0.5 }}
            onFinish={() => model.mutation.mutate()}
            className="VentureContracts__form"
        >
            <Form.Item name="side" label="Trade direction">
                <Select
                    options={[
                        { value: "buy", label: "Buy venture tokens" },
                        { value: "sell", label: "Sell venture tokens" },
                    ]}
                />
            </Form.Item>
            <Form.Item
                name="amount"
                label={`You pay (${model.input.symbol})`}
                rules={[{ required: true }, { validator: validatePositiveAmount }, { max: 100 }]}
            >
                <Input placeholder="0.00" />
            </Form.Item>
            <Form.Item
                name="slippage"
                label="Maximum slippage (%)"
                rules={[{ required: true }, { type: "number", min: 0.01, max: 10 }]}
            >
                <InputNumber min={0.01} max={10} precision={2} />
            </Form.Item>
            {model.query.data && (
                <Flex vertical gap={16} className="VentureContracts__quote">
                    <Statistic
                        title={`Estimated receive (${model.output.symbol})`}
                        value={formatUnits(model.query.data.amountOut, model.output.decimals)}
                    />
                    <Typography.Text>
                        Rate: 1 {model.input.symbol} ={" "}
                        {formatUnits(
                            (model.query.data.amountOut * parseUnits("1", model.input.decimals)) /
                                model.query.data.amountIn,
                            model.output.decimals,
                        )}{" "}
                        {model.output.symbol}
                    </Typography.Text>
                    <Typography.Text>
                        Minimum receive: {formatUnits(model.query.data.minimumOut, model.output.decimals)}{" "}
                        {model.output.symbol}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                        DAO router fee: {model.query.data.routerFeeBps / 100}%. Quotes refresh every 15 seconds and
                        include pool price impact and fees.
                    </Typography.Text>
                </Flex>
            )}
            {model.query.error && <Alert type="error" showIcon message={model.query.error.message} />}
            {model.mutation.error && <Alert type="error" showIcon message={model.mutation.error.message} />}
            {model.mutation.data && (
                <Typography.Paragraph copyable className="VentureContracts__confirmedTrade">
                    Confirmed trade: {model.mutation.data}
                </Typography.Paragraph>
            )}
            <Alert
                type="info"
                showIcon
                message="Only liquid tokens can be sold"
                description="ERC-20 trades may ask for an exact-amount approval before the swap. Check both wallet requests. Rooted tokens cannot be sold until DAO governance unroots them."
            />
            <Button
                type="primary"
                htmlType="submit"
                loading={model.mutation.isPending || model.query.isFetching}
                disabled={
                    !props.connected ||
                    !model.query.data ||
                    Boolean(model.query.error) ||
                    model.query.isFetching ||
                    model.mutation.isPending
                }
            >
                {model.side === "buy" ? "Buy tokens" : "Sell tokens"}
            </Button>
            {!props.connected && <Typography.Text>Connect your wallet below to trade.</Typography.Text>}
        </Form>
    );
};
