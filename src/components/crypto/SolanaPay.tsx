import * as React from "react";

import { Button, Spin } from "antd";

import type { FormModel } from "../../types";
import type { PaymentWalletSelection } from "../order/types";

import { PaymentAttemptStatus } from "./payment/PaymentAttemptStatus";
import { SolanaPayView } from "./payment/SolanaPayView";
import { useSolanaPayment } from "./payment/useSolanaPayment";
import { SolanaConnect } from "./SolanaConnect";

export interface SolanaPayProps {
    setTransactionId: (txId: string) => Promise<void>;
    model: FormModel;
    preferredWallet?: PaymentWalletSelection;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
}

export const SolanaPay: React.FunctionComponent<SolanaPayProps> = (props) => {
    const payment = useSolanaPayment(props);
    return (
        <SolanaPayView
            payButton={
                payment.canPay && (
                    <Button
                        icon={payment.pending ? <Spin /> : undefined}
                        className="SolanaButton SolanaButton--payment"
                        type="primary"
                        disabled={payment.disabled}
                        onClick={payment.pay}
                    >
                        {payment.pending ? "Loading..." : "Pay"}
                    </Button>
                )
            }
            connectButton={
                payment.showConnect ? (
                    <SolanaConnect
                        payment
                        label="Connect"
                        disabled={payment.disabled}
                        preferredWallet={props.preferredWallet}
                    />
                ) : undefined
            }
            status={
                <PaymentAttemptStatus attempt={payment.attempt} error={payment.error} orderId={props.model.orderId} />
            }
        />
    );
};
