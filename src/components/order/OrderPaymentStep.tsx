import * as React from "react";

import { DollarOutlined } from "@ant-design/icons";
import { Alert, Card, Divider, Flex, Grid, List, Result, Tag, Typography, message } from "antd";

import type { CryptoChain } from "../../types";
import { SolanaPay } from "../crypto/SolanaPay";
import { ThirdwebPayButton } from "../crypto/ThirdwebPayButton";
import { TronPaymentButton } from "../crypto/TronPaymentButton";
import { useUpdateOrderMutation, useUpdateUserByIdMutation } from "../hooks";
import { formatPriceFromCents, formatUsdFromCents } from "../shared/product/utils";

import { CRYPTO_CHAIN_LABELS, CRYPTO_CHAIN_TICKERS } from "./constants";
import { OrderPaymentLockProvider } from "./OrderPaymentLockContext";
import {
    appendPaymentWalletSelection,
    appendTransactionHashRows,
    buildOrderEntryKey,
    buildPaymentKey,
    collectOrderChainPaymentAmounts,
    collectProductIdsForChain,
    hasPaymentWalletSelection,
    type ChainPaymentAmount,
    resolveOrderRecipientAddress,
    replaceSubmittedOrderInList,
    toExistingTransactionHashRows,
    toUserUpdateWalletInputs,
} from "./payment/utils";
import { RememberWalletCheckbox } from "./RememberWalletCheckbox";
import type {
    PaymentProfileUsersByUrl,
    PaymentWalletSelection,
    SaveTransactionHashParams,
    SubmittedOrder,
} from "./types";

type OrderPaymentStepProps = {
    onAllPaymentsComplete: () => void;
    onPaymentWalletRemembered?: () => Promise<void>;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    profileUsersByUrl: PaymentProfileUsersByUrl;
    submittedOrders: SubmittedOrder[];
};

export const OrderPaymentStep: React.FunctionComponent<OrderPaymentStepProps> = (props) => {
    const { lg } = Grid.useBreakpoint();
    const updateOrderMutation = useUpdateOrderMutation();
    const updateUserMutation = useUpdateUserByIdMutation();
    const [submittedOrdersState, setSubmittedOrdersState] = React.useState<SubmittedOrder[]>(props.submittedOrders);
    const [completedPaymentKeys, setCompletedPaymentKeys] = React.useState<Record<string, boolean>>({});
    const [selectedWallets, setSelectedWallets] = React.useState<Record<string, PaymentWalletSelection>>({});
    const [rememberWallets, setRememberWallets] = React.useState<Record<string, boolean>>({});
    const [profileUsersByUrlState, setProfileUsersByUrlState] = React.useState<PaymentProfileUsersByUrl>(
        props.profileUsersByUrl,
    );

    React.useEffect(() => {
        setSubmittedOrdersState(props.submittedOrders);
    }, [props.submittedOrders]);

    React.useEffect(() => {
        setProfileUsersByUrlState(props.profileUsersByUrl);
    }, [props.profileUsersByUrl]);

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

    const markPaymentSubmitted = (entry: SubmittedOrder, chain: CryptoChain) => {
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
    };

    const saveTransactionHash = async ({ entry, chain, txHash }: SaveTransactionHashParams): Promise<boolean> => {
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
                setSubmittedOrdersState((previous) =>
                    replaceSubmittedOrderInList(previous, {
                        url: entry.url,
                        order: updatedOrder as SubmittedOrder["order"],
                    }),
                );
            }

            message.success(`Saved transaction hash for order ${orderId}`);
            return true;
        } catch (error) {
            console.error(error);
            message.error(`Could not save transaction hash for order ${orderId}`);
            return false;
        }
    };

    const rememberSelectedWallet = async (entry: SubmittedOrder, chain: CryptoChain) => {
        const paymentKey = buildPaymentKey(entry, chain);
        const selection = selectedWallets[paymentKey];
        const profileUser = profileUsersByUrlState[entry.url];

        if (!rememberWallets[paymentKey] || !selection || !profileUser) {
            return;
        }

        if (hasPaymentWalletSelection(profileUser.wallets, selection)) {
            return;
        }

        const nextWallets = appendPaymentWalletSelection(profileUser.wallets, selection);

        try {
            await updateUserMutation.mutateAsync({
                url: entry.url,
                id: profileUser.id,
                data: {
                    wallets: toUserUpdateWalletInputs(nextWallets),
                },
            });

            setProfileUsersByUrlState((previous) => ({
                ...previous,
                [entry.url]: {
                    ...profileUser,
                    wallets: nextWallets,
                },
            }));
            setRememberWallets((previous) => ({
                ...previous,
                [paymentKey]: false,
            }));
            message.success("Wallet saved for future payments");
            await props.onPaymentWalletRemembered?.();
        } catch (error) {
            console.error(error);
            message.error("Could not save wallet for future payments");
        }
    };

    const handleWalletSelected = async (entry: SubmittedOrder, selection: PaymentWalletSelection) => {
        const paymentKey = buildPaymentKey(entry, selection.chain);
        const previousSelection = selectedWallets[paymentKey];
        const hasSameSelection =
            previousSelection &&
            previousSelection.address === selection.address &&
            previousSelection.chain === selection.chain &&
            previousSelection.provider === selection.provider;

        if (!hasSameSelection) {
            setSelectedWallets((previous) => ({
                ...previous,
                [paymentKey]: selection,
            }));
            setRememberWallets((previous) => ({
                ...previous,
                [paymentKey]: false,
            }));
        }

        await props.onPayerAddressSelected(entry, selection.address);
    };

    return (
        <OrderPaymentLockProvider>
            <Typography.Paragraph type="secondary">
                Orders submitted. Pay each order using the chain amount below.
            </Typography.Paragraph>

            {submittedOrdersState.map((entry) => {
                const chainPayments = collectOrderChainPaymentAmounts(entry.order);
                const orderTotal =
                    formatUsdFromCents(entry.order.amount) ||
                    formatPriceFromCents(entry.order.amount, entry.order.currency);

                return (
                    <Card
                        key={buildOrderEntryKey(entry.url, entry.order.id)}
                        title={`Order ${entry.order.id}`}
                        extra={
                            <Tag
                                color={orderTotal ? "gold" : "default"}
                                icon={orderTotal ? <DollarOutlined /> : undefined}
                            >
                                {orderTotal ? `Price: ${orderTotal}` : "Price: N/A"}
                            </Tag>
                        }
                    >
                        {chainPayments.length === 0 ? (
                            <Alert showIcon type="warning" message="No chain-native prices available for this order." />
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
                                    const selectedWallet = selectedWallets[paymentKey];
                                    const profileUser = profileUsersByUrlState[entry.url];
                                    const showRememberWallet = Boolean(
                                        selectedWallet &&
                                        profileUser &&
                                        !hasPaymentWalletSelection(profileUser.wallets, selectedWallet),
                                    );

                                    const handleTransactionId = async (txHash: string) => {
                                        const isSaved = await saveTransactionHash({
                                            entry,
                                            chain: chainPayment.chain,
                                            txHash,
                                        });

                                        if (!isSaved) {
                                            return;
                                        }

                                        await rememberSelectedWallet(entry, chainPayment.chain);
                                        markPaymentSubmitted(entry, chainPayment.chain);
                                    };

                                    return (
                                        <List.Item
                                            actions={[
                                                isPaymentCompleted ? (
                                                    <div
                                                        key={`${entry.order.id}-${chainPayment.chain}-success`}
                                                        className="CryptoPaymentGroup"
                                                    >
                                                        <Result status="success" title="Payment submitted" />
                                                    </div>
                                                ) : canPay ? (
                                                    <Flex
                                                        key={`${entry.order.id}-${chainPayment.chain}`}
                                                        align="center"
                                                        gap={8}
                                                        vertical
                                                    >
                                                        {!lg && <Divider />}
                                                        {chainPayment.chain === "ethereum" && (
                                                            <ThirdwebPayButton
                                                                formModel={{
                                                                    amount: chainPayment.amountInSmallestUnit,
                                                                    orderId: entry.order.id,
                                                                    recipient: recipient!,
                                                                }}
                                                                onWalletSelected={async (wallet) => {
                                                                    await handleWalletSelected(entry, wallet);
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
                                                                onWalletSelected={async (wallet) => {
                                                                    await handleWalletSelected(entry, wallet);
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
                                                                onWalletSelected={async (wallet) => {
                                                                    await handleWalletSelected(entry, wallet);
                                                                }}
                                                                setTransactionId={handleTransactionId}
                                                            />
                                                        )}
                                                        {showRememberWallet && (
                                                            <RememberWalletCheckbox
                                                                checked={Boolean(rememberWallets[paymentKey])}
                                                                disabled={updateUserMutation.isPending}
                                                                onChange={(checked) => {
                                                                    setRememberWallets((previous) => ({
                                                                        ...previous,
                                                                        [paymentKey]: checked,
                                                                    }));
                                                                }}
                                                            />
                                                        )}
                                                    </Flex>
                                                ) : !hasExpectedAmount ? (
                                                    <Tag
                                                        key={`${entry.order.id}-${chainPayment.chain}-unpriced`}
                                                        color="warning"
                                                    >
                                                        Price unavailable for this chain
                                                    </Tag>
                                                ) : (
                                                    <Tag
                                                        key={`${entry.order.id}-${chainPayment.chain}-missing`}
                                                        color="error"
                                                    >
                                                        Missing recipient wallet for this chain
                                                    </Tag>
                                                ),
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={`${CRYPTO_CHAIN_LABELS[chainPayment.chain]} (${CRYPTO_CHAIN_TICKERS[chainPayment.chain]})`}
                                                description={
                                                    <Flex vertical gap={4}>
                                                        <Typography.Text>
                                                            Amount due: {chainPayment.amount}{" "}
                                                            {CRYPTO_CHAIN_TICKERS[chainPayment.chain]}
                                                        </Typography.Text>
                                                        {recipient && (
                                                            <Typography.Text type="secondary">
                                                                Recipient: {recipient}
                                                            </Typography.Text>
                                                        )}
                                                    </Flex>
                                                }
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
