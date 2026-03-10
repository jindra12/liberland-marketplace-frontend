import * as React from "react";
import { DollarOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Divider, Flex, Grid, List, Tag, Typography, message } from "antd";
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
import { useUpdateOrderMutation } from "../hooks";
import type { CryptoChain } from "../../types";
import type { SaveTransactionHashParams, SubmittedOrder } from "./types";
import {
    appendTransactionHashRows,
    buildPaymentKey,
    collectProductIdsForChain,
    replaceSubmittedOrderInList,
    toExistingTransactionHashRows,
} from "./utils";

type OrderPaymentStepProps = {
    submittedOrders: SubmittedOrder[];
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    onBackToOrderForm: () => void;
    onAllPaymentsComplete: () => void;
};

export const OrderPaymentStep: React.FunctionComponent<OrderPaymentStepProps> = (props) => {
    const { lg } = Grid.useBreakpoint();
    const updateOrderMutation = useUpdateOrderMutation();
    const [submittedOrdersState, setSubmittedOrdersState] = React.useState<SubmittedOrder[]>(props.submittedOrders);
    const [completedPaymentKeys, setCompletedPaymentKeys] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        setSubmittedOrdersState(props.submittedOrders);
    }, [props.submittedOrders]);

    const requiredPaymentKeys = React.useMemo(() => {
        return submittedOrdersState.reduce<string[]>((acc, entry) => {
            const chainPriceKeys = collectOrderChainPrices(entry.order)
                .filter((chainPrice) => {
                    const recipient = resolveOrderRecipientAddress(entry.order, chainPrice.chain);
                    const expectedAmount = chainPrice.expectedNativeAmount;
                    return Boolean(recipient && expectedAmount && expectedAmount > 0);
                })
                .map((chainPrice) => buildPaymentKey(entry, chainPrice.chain));

            return [...acc, ...chainPriceKeys];
        }, []);
    }, [submittedOrdersState]);

    const markPaymentSubmitted = React.useCallback(
        (entry: SubmittedOrder, chain: CryptoChain) => {
            const key = buildPaymentKey(entry, chain);
            if (completedPaymentKeys[key]) {
                return;
            }

            const nextCompletedPaymentKeys = {
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

    const saveTransactionHash = React.useCallback(
        async ({ entry, chain, txHash }: SaveTransactionHashParams): Promise<boolean> => {
            const orderId = entry.order.id;
            const productIds = collectProductIdsForChain(entry.order, chain);
            const existingRows = toExistingTransactionHashRows(entry.order);
            const { nextRows } = appendTransactionHashRows({
                existingRows,
                productIds,
                chain,
                txHash,
            });

            try {
                const result = await updateOrderMutation.mutateAsync({
                    url: entry.url,
                    orderId,
                    draft: false,
                    data: {
                        transactionHashes: nextRows,
                    },
                });

                const updatedOrder = result.updateOrder;
                if (updatedOrder?.id) {
                    setSubmittedOrdersState((prev) => replaceSubmittedOrderInList(prev, {
                        url: entry.url,
                        order: updatedOrder as SubmittedOrder["order"],
                    }));
                }

                message.success(`Saved transaction hash for order ${orderId}`);
                return true;
            } catch (error) {
                console.error(error);
                message.error(`Could not save transaction hash for order ${orderId}`);
                return false;
            }
        },
        [updateOrderMutation],
    );

    return (
        <>
            <Typography.Paragraph type="secondary">
                Orders submitted. Pay each order using the chain amount below.
            </Typography.Paragraph>

            {submittedOrdersState.map((entry) => {
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
                                    const handleTransactionId = async (txHash: string) => {
                                        const isSaved = await saveTransactionHash({
                                            entry,
                                            chain: chainPrice.chain,
                                            txHash,
                                        });

                                        if (!isSaved) {
                                            return;
                                        }

                                        markPaymentSubmitted(
                                            entry,
                                            chainPrice.chain,
                                        );
                                    };

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
                                                                setTransactionId={handleTransactionId}
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
                                                                setTransactionId={handleTransactionId}
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
                                                                setTransactionId={handleTransactionId}
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
