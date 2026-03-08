import * as React from "react";
import { Alert, Button, Card, Flex, List, Tag, Typography, message } from "antd";
import {
    CRYPTO_CHAIN_LABELS,
    CRYPTO_CHAIN_TICKERS,
    buildOrderEntryKey,
    collectOrderChainPrices,
    formatNativeCryptoAmount,
    formatPriceFromCents,
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
};

export const OrderPaymentStep: React.FunctionComponent<OrderPaymentStepProps> = (props) => {
    return (
        <>
            <Typography.Paragraph type="secondary">
                Orders submitted. Pay each order using the chain amount below.
            </Typography.Paragraph>

            {props.submittedOrders.map((entry) => {
                const chainPrices = collectOrderChainPrices(entry.order);
                const orderTotal = formatPriceFromCents(entry.order.amount, entry.order.currency);
                return (
                    <Card
                        key={buildOrderEntryKey(entry.url, entry.order.id)}
                        title={`Order ${entry.order.id}`}
                        extra={(
                            <Tag color="processing">
                                {orderTotal || "N/A"}
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
                                renderItem={(chainPrice) => {
                                    const recipient = resolveOrderRecipientAddress(entry.order, chainPrice.chain);
                                    const expectedAmount = chainPrice.expectedNativeAmount;
                                    const hasExpectedAmount = expectedAmount && expectedAmount > 0;
                                    const canPay = Boolean(recipient && hasExpectedAmount);

                                    return (
                                        <List.Item
                                            actions={[
                                                canPay ? (
                                                    <Flex key={`${entry.order.id}-${chainPrice.chain}`} align="center" gap={8}>
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
                                                                setTransactionId={(txId) => {
                                                                    message.success(`Ethereum payment submitted: ${txId}`);
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
                                                                setTransactionId={(txId) => {
                                                                    message.success(`Solana payment submitted: ${txId}`);
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
                                                                setTransactionId={(txId) => {
                                                                    message.success(`Tron payment submitted: ${txId}`);
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
