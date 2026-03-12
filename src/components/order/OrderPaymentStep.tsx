import * as React from "react";
import { DollarOutlined } from "@ant-design/icons";
import { Alert, Card, Divider, Flex, Grid, List, Result, Tag, Typography, message } from "antd";
import {
    CRYPTO_CHAIN_LABELS,
    CRYPTO_CHAIN_TICKERS,
    buildOrderEntryKey,
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
    collectOrderChainPaymentAmounts,
    collectProductIdsForChain,
    type ChainPaymentAmount,
    replaceSubmittedOrderInList,
    toExistingTransactionHashRows,
} from "./utils";
import { OrderPaymentLockProvider } from "./OrderPaymentLockContext";

type OrderPaymentStepProps = {
    submittedOrders: SubmittedOrder[];
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
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
            const chainPriceKeys = collectOrderChainPaymentAmounts(entry.order)
                .filter((chainPayment) => {
                    const recipient = resolveOrderRecipientAddress(entry.order, chainPayment.chain);
                    return Boolean(recipient && chainPayment.amountInSmallestUnit > 0n);
                })
                .map((chainPayment) => buildPaymentKey(entry, chainPayment.chain));

            return [...acc, ...chainPriceKeys];
        }, []);
    }, [submittedOrdersState]);

    const markPaymentSubmitted = React.useCallback(
        (entry: SubmittedOrder, chain: CryptoChain) => {
            const key = buildPaymentKey(entry, chain);
            setCompletedPaymentKeys((previous) => {
                if (previous[key]) {
                    return previous;
                }

                const nextCompletedPaymentKeys = {
                    ...previous,
                    [key]: true,
                };

                const allDone = requiredPaymentKeys.every((requiredKey) => Boolean(nextCompletedPaymentKeys[requiredKey]));
                if (allDone) {
                    props.onAllPaymentsComplete();
                }

                return nextCompletedPaymentKeys;
            });
        },
        [props, requiredPaymentKeys],
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
        <OrderPaymentLockProvider>
            <Typography.Paragraph type="secondary">
                Orders submitted. Pay each order using the chain amount below.
            </Typography.Paragraph>

            {submittedOrdersState.map((entry) => {
                const chainPayments = collectOrderChainPaymentAmounts(entry.order);
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
                        {chainPayments.length === 0 ? (
                            <Alert
                                showIcon
                                type="warning"
                                message="No chain-native prices available for this order."
                            />
                        ) : (
                            <List
                                dataSource={chainPayments}
                                itemLayout={lg ? "horizontal" : "vertical"}
                                renderItem={(chainPayment: ChainPaymentAmount) => {
                                    const recipient = resolveOrderRecipientAddress(entry.order, chainPayment.chain);
                                    const hasExpectedAmount = chainPayment.amountInSmallestUnit > 0n;
                                    const canPay = Boolean(recipient && hasExpectedAmount);
                                    const paymentKey = buildPaymentKey(entry, chainPayment.chain);
                                    const isPaymentCompleted = Boolean(completedPaymentKeys[paymentKey]);
                                    const handleTransactionId = async (txHash: string) => {
                                        const isSaved = await saveTransactionHash({
                                            entry,
                                            chain: chainPayment.chain,
                                            txHash,
                                        });

                                        if (!isSaved) {
                                            return;
                                        }

                                        markPaymentSubmitted(
                                            entry,
                                            chainPayment.chain,
                                        );
                                    };

                                    return (
                                        <List.Item
                                            actions={[
                                                isPaymentCompleted ? (
                                                    <div
                                                        key={`${entry.order.id}-${chainPayment.chain}-success`}
                                                        className="CryptoPaymentGroup"
                                                    >
                                                        <Result
                                                            status="success"
                                                            title="Payment submitted"
                                                        />
                                                    </div>
                                                ) : canPay ? (
                                                    <Flex key={`${entry.order.id}-${chainPayment.chain}`} align="center" gap={8} vertical>
                                                        {!lg && <Divider />}
                                                        {chainPayment.chain === "ethereum" && (
                                                            <ThirdwebPayButton
                                                                formModel={{
                                                                    amount: chainPayment.amountInSmallestUnit,
                                                                    orderId: entry.order.id,
                                                                    recipient: recipient!,
                                                                }}
                                                                onPayerAddressSelected={async (wallet) => {
                                                                    await props.onPayerAddressSelected(entry, wallet);
                                                                }}
                                                                setTransactionId={handleTransactionId}
                                                            />
                                                        )}
                                                        {chainPayment.chain === "solana" && (
                                                            <SolanaPay
                                                                model={{
                                                                    amount: chainPayment.amountInSmallestUnit,
                                                                    orderId: entry.order.id,
                                                                    recipient: recipient!,
                                                                }}
                                                                onPayerAddressSelected={async (wallet) => {
                                                                    await props.onPayerAddressSelected(entry, wallet);
                                                                }}
                                                                setTransactionId={handleTransactionId}
                                                            />
                                                        )}
                                                        {chainPayment.chain === "tron" && (
                                                            <TronPaymentButton
                                                                formModel={{
                                                                    amount: chainPayment.amountInSmallestUnit,
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
                                                    <Tag key={`${entry.order.id}-${chainPayment.chain}-unpriced`} color="warning">
                                                        Price unavailable for this chain
                                                    </Tag>
                                                ) : (
                                                    <Tag key={`${entry.order.id}-${chainPayment.chain}-missing`} color="error">
                                                        Missing recipient wallet for this chain
                                                    </Tag>
                                                ),
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={`${CRYPTO_CHAIN_LABELS[chainPayment.chain]} (${CRYPTO_CHAIN_TICKERS[chainPayment.chain]})`}
                                                description={(
                                                    <Flex vertical gap={4}>
                                                        <Typography.Text>
                                                            Amount due: {chainPayment.amount} {CRYPTO_CHAIN_TICKERS[chainPayment.chain]}
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
        </OrderPaymentLockProvider>
    );
};
