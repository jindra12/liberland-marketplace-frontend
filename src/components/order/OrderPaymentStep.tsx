import * as React from "react";
import { DollarOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Divider, Flex, Grid, List, Tag, Typography } from "antd";
import {
    CRYPTO_CHAIN_LABELS,
    CRYPTO_CHAIN_TICKERS,
    buildOrderEntryKey,
    collectOrderChainPrices,
    formatNativeCryptoAmount,
    formatPriceFromCents,
    formatUsdFromCents,
    resolveOrderRecipientAddress,
} from "../../utils";
import { ThirdwebPayButton } from "../crypto/ThirdwebPayButton";
import { SolanaPay } from "../crypto/SolanaPay";
import { TronPaymentButton } from "../crypto/TronPaymentButton";
import type { SubmittedOrder } from "./types";

type OrderPaymentStepProps = {
    submittedOrders: SubmittedOrder[];
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    onBackToOrderForm: () => void;
    onAllPaymentsComplete: () => void;
};

const buildPaymentKey = (entry: SubmittedOrder, chain: "ethereum" | "solana" | "tron") => {
    return `${entry.url}::${entry.order.id}::${chain}`;
};

export const OrderPaymentStep: React.FunctionComponent<OrderPaymentStepProps> = (props) => {
    const { lg } = Grid.useBreakpoint();
    const [completedPaymentKeys, setCompletedPaymentKeys] = React.useState<Record<string, true>>({});

    const requiredPaymentKeys = React.useMemo(() => {
        return props.submittedOrders.reduce<string[]>((acc, entry) => {
            const chainPriceKeys = collectOrderChainPrices(entry.order)
                .filter((chainPrice) => {
                    const recipient = resolveOrderRecipientAddress(entry.order, chainPrice.chain);
                    const expectedAmount = chainPrice.expectedNativeAmount;
                    return Boolean(recipient && expectedAmount && expectedAmount > 0);
                })
                .map((chainPrice) => buildPaymentKey(entry, chainPrice.chain));

            return [...acc, ...chainPriceKeys];
        }, []);
    }, [props.submittedOrders]);

    const markPaymentSubmitted = React.useCallback(
        (entry: SubmittedOrder, chain: "ethereum" | "solana" | "tron") => {
            const key = buildPaymentKey(entry, chain);
            if (completedPaymentKeys[key]) {
                return;
            }

            const nextCompletedPaymentKeys: Record<string, true> = {
                ...completedPaymentKeys,
                [key]: true,
            };

            setCompletedPaymentKeys(nextCompletedPaymentKeys);

            const allDone = requiredPaymentKeys.every((requiredKey) => Boolean(nextCompletedPaymentKeys[requiredKey]));

            if (allDone) {
                props.onAllPaymentsComplete();
            }
        },
        [completedPaymentKeys, props, requiredPaymentKeys],
    );

    return (
        <>
            <Typography.Paragraph type="secondary">
                Orders submitted. Pay each order using the chain amount below.
            </Typography.Paragraph>

            {props.submittedOrders.map((entry) => {
                const chainPrices = collectOrderChainPrices(entry.order);
                const orderTotal = formatUsdFromCents(entry.order.amount) || formatPriceFromCents(entry.order.amount, entry.order.currency);
                return (
                    <Card
                        key={buildOrderEntryKey(entry.url, entry.order.id)}
                        title={`Order ${entry.order.id}`}
                        extra={(
                            <Tag color={orderTotal ? "gold" : "default"} icon={orderTotal ? <DollarOutlined /> : undefined}>
                                {orderTotal ? `Price: ${orderTotal}` : "Price: N/A"}
                            </Tag>
                        )}
                    >
                        {chainPrices.length === 0 ? (
                            <Alert
                                showIcon
                                type="warning"
                                message="No crypto prices available for this order yet."
                            />
                        ) : (
                            <List
                                dataSource={chainPrices}
                                itemLayout={lg ? "horizontal" : "vertical"}
                                renderItem={(chainPrice) => {
                                    const recipient = resolveOrderRecipientAddress(entry.order, chainPrice.chain);
                                    const expectedAmount = chainPrice.expectedNativeAmount;
                                    const hasExpectedAmount = expectedAmount && expectedAmount > 0;
                                    const canPay = Boolean(recipient && hasExpectedAmount);

                                    return (
                                        <List.Item
                                            actions={[
                                                canPay ? (
                                                    <Flex key={`${entry.order.id}-${chainPrice.chain}`} align="center" gap={8} vertical>
                                                        {!lg && <Divider />}
                                                        {chainPrice.chain === "ethereum" && (
                                                            <ThirdwebPayButton
                                                                formModel={{
                                                                    amount: String(expectedAmount),
                                                                    orderId: entry.order.id,
                                                                    recipient: recipient!,
                                                                }}
                                                                onPayerAddressSelected={async (wallet) => {
                                                                    await props.onPayerAddressSelected(entry, wallet);
                                                                }}
                                                                setTransactionId={() => {
                                                                    markPaymentSubmitted(entry, chainPrice.chain);
                                                                }}
                                                            />
                                                        )}
                                                        {chainPrice.chain === "solana" && (
                                                            <SolanaPay
                                                                model={{
                                                                    amount: String(expectedAmount),
                                                                    orderId: entry.order.id,
                                                                    recipient: recipient!,
                                                                }}
                                                                onPayerAddressSelected={async (wallet) => {
                                                                    await props.onPayerAddressSelected(entry, wallet);
                                                                }}
                                                                setTransactionId={() => {
                                                                    markPaymentSubmitted(entry, chainPrice.chain);
                                                                }}
                                                            />
                                                        )}
                                                        {chainPrice.chain === "tron" && (
                                                            <TronPaymentButton
                                                                formModel={{
                                                                    amount: String(expectedAmount),
                                                                    orderId: entry.order.id,
                                                                    recipient: recipient!,
                                                                }}
                                                                onPayerAddressSelected={async (wallet) => {
                                                                    await props.onPayerAddressSelected(entry, wallet);
                                                                }}
                                                                setTransactionId={() => {
                                                                    markPaymentSubmitted(entry, chainPrice.chain);
                                                                }}
                                                            />
                                                        )}
                                                    </Flex>
                                                ) : !hasExpectedAmount ? (
                                                    <Tag key={`${entry.order.id}-${chainPrice.chain}-unpriced`} color="warning">
                                                        Price unavailable for this chain
                                                    </Tag>
                                                ) : (
                                                    <Tag key={`${entry.order.id}-${chainPrice.chain}-missing`} color="error">
                                                        Missing recipient wallet for this chain
                                                    </Tag>
                                                ),
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={`${CRYPTO_CHAIN_LABELS[chainPrice.chain]} (${CRYPTO_CHAIN_TICKERS[chainPrice.chain]})`}
                                                description={(
                                                    <Flex vertical gap={4}>
                                                        <Typography.Text>
                                                            Amount due: {formatNativeCryptoAmount(expectedAmount)} {CRYPTO_CHAIN_TICKERS[chainPrice.chain]}
                                                        </Typography.Text>
                                                        <Typography.Text type="secondary">
                                                            Rate: {formatNativeCryptoAmount(chainPrice.stablePerNative)} USD per {CRYPTO_CHAIN_TICKERS[chainPrice.chain]}
                                                        </Typography.Text>
                                                        {recipient && (
                                                            <Typography.Text type="secondary">
                                                                Recipient: {recipient}
                                                            </Typography.Text>
                                                        )}
                                                    </Flex>
                                                )}
                                            />
                                        </List.Item>
                                    );
                                }}
                            />
                        )}
                    </Card>
                );
            })}

            <Flex justify="space-between" wrap gap={12}>
                <Button onClick={props.onBackToOrderForm}>
                    Back to order form
                </Button>
            </Flex>
        </>
    );
};
