import * as React from "react";

import { SolanaPay } from "../crypto/SolanaPay";
import { ThirdwebPayButton } from "../crypto/ThirdwebPayButton";
import { TronPaymentButton } from "../crypto/TronPaymentButton";

import { type ChainPaymentAmount } from "./payment/utils";
import type { PaymentWalletSelection, SubmittedOrder } from "./types";

type OrderPaymentChainButtonProps = {
    chainPayment: ChainPaymentAmount;
    entry: SubmittedOrder;
    onTransactionId: (txHash: string) => Promise<void>;
    onWalletSelected: (selection: PaymentWalletSelection) => Promise<void>;
    recipient: string;
};

export const OrderPaymentChainButton: React.FunctionComponent<OrderPaymentChainButtonProps> = (
    props,
) => {
    if (props.chainPayment.chain === "ethereum") {
        return (
            <ThirdwebPayButton
                formModel={{
                    amount: props.chainPayment.amountInSmallestUnit,
                    orderId: props.entry.order.id,
                    recipient: props.recipient,
                }}
                onWalletSelected={props.onWalletSelected}
                setTransactionId={props.onTransactionId}
            />
        );
    }

    if (props.chainPayment.chain === "solana") {
        return (
            <SolanaPay
                model={{
                    amount: props.chainPayment.amountInSmallestUnit,
                    orderId: props.entry.order.id,
                    recipient: props.recipient,
                }}
                onWalletSelected={props.onWalletSelected}
                setTransactionId={props.onTransactionId}
            />
        );
    }

    return (
        <TronPaymentButton
            formModel={{
                amount: props.chainPayment.amountInSmallestUnit,
                orderId: props.entry.order.id,
                recipient: props.recipient,
            }}
            onWalletSelected={props.onWalletSelected}
            setTransactionId={props.onTransactionId}
        />
    );
};
