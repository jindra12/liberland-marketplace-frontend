import * as React from "react";

import { ButtonProps, WalletActionButton, WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";
import Button from "antd/es/button";

import { FormModel } from "../../types";
import type { PaymentWalletSelection } from "../order/types";

import { PaymentAttemptStatus } from "./payment/PaymentAttemptStatus";
import { TronPaymentButtonView } from "./payment/TronPaymentButtonView";
import { useTronPayment } from "./payment/useTronPayment";

export interface TronPaymentButtonProps {
    formModel: FormModel;
    setTransactionId: (txId: string) => Promise<void>;
    preferredWallet?: PaymentWalletSelection;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
}

export const TronPaymentButton: React.FunctionComponent<TronPaymentButtonProps> = (props) => {
    const payment = useTronPayment(props);
    const buttonProps: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> = {
        type: "button",
        className: "TronButton TronButton--payment",
        disabled: payment.disabled,
        icon: "/tron.svg",
    };

    return (
        <TronPaymentButtonView
            payButton={
                payment.canPay && (
                    <Button
                        type="primary"
                        className="TronButton TronButton--payment"
                        loading={payment.pending}
                        disabled={payment.disabled}
                        onClick={payment.pay}
                    >
                        Pay
                    </Button>
                )
            }
            connectButton={
                payment.showConnect ? (
                    <WalletModalProvider>
                        <WalletActionButton {...buttonProps}>
                            {payment.canPay ? "Connected" : "Connect"}
                        </WalletActionButton>
                    </WalletModalProvider>
                ) : undefined
            }
            status={
                <PaymentAttemptStatus
                    attempt={payment.attempt}
                    error={payment.error}
                    orderId={props.formModel.orderId}
                />
            }
        />
    );
};
