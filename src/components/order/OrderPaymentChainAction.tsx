import * as React from "react";

import { Divider, Flex, Result, Tag } from "antd";

import { OrderPaymentChainButton } from "./OrderPaymentChainButton";
import { findPaymentWalletForChain, type ChainPaymentAmount } from "./payment/utils";
import { RememberWalletCheckbox } from "./RememberWalletCheckbox";
import type { PaymentProfileUser, SubmittedOrder } from "./types";
import { useOrderPaymentChainController } from "./useOrderPaymentChainController";

type OrderPaymentChainActionProps = {
    canPay: boolean;
    chainPayment: ChainPaymentAmount;
    entry: SubmittedOrder;
    hasExpectedAmount: boolean;
    isLargeScreen: boolean;
    onEntryUpdated: (entry: SubmittedOrder) => void;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    onPaymentCompleted: (paymentKey: string) => void;
    onPaymentWalletRemembered?: () => Promise<void>;
    paymentKey: string;
    profileUser?: PaymentProfileUser;
    recipient?: string;
};

export const OrderPaymentChainAction: React.FunctionComponent<OrderPaymentChainActionProps> = (
    props,
) => {
    const controller = useOrderPaymentChainController(props);
    const preferredWallet = findPaymentWalletForChain(props.profileUser, props.chainPayment.chain);

    if (controller.isPaymentCompleted) {
        return (
            <div className="CryptoPaymentGroup">
                <Result status="success" title="Payment submitted" />
            </div>
        );
    }

    if (props.canPay && props.recipient) {
        return (
            <Flex align="stretch" gap={8} vertical className="OrderPaymentChainAction">
                {!props.isLargeScreen && <Divider />}
                <OrderPaymentChainButton
                    chainPayment={props.chainPayment}
                    entry={props.entry}
                    onTransactionId={controller.handleTransactionId}
                    onWalletSelected={controller.handleWalletSelected}
                    recipient={props.recipient}
                    preferredWallet={preferredWallet}
                />
                {controller.showRememberWallet && (
                    <RememberWalletCheckbox
                        checked={controller.rememberWallet}
                        disabled={controller.isSavingWallet}
                        onChange={controller.setRememberWallet}
                    />
                )}
            </Flex>
        );
    }

    if (!props.hasExpectedAmount) {
        return <Tag color="warning">Price unavailable for this chain</Tag>;
    }

    return <Tag color="error">Missing recipient wallet for this chain</Tag>;
};
