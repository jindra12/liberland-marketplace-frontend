import * as React from "react";

import Button from "antd/es/button";
import Result from "antd/es/result";
import Spin from "antd/es/spin";

import { SolanaConnect } from "../../../src/components/crypto/SolanaConnect";
import { useOrderPaymentLockContext } from "../../../src/components/order/OrderPaymentLockContext";
import type { PaymentWalletSelection } from "../../../src/components/order/types";
import { type FormModel } from "../../../src/types";
import { SolanaPayView } from "../../../src/components/crypto/payment/SolanaPayView";

export interface SolanaPayProps {
    setTransactionId: (txId: string) => Promise<void>;
    model: FormModel;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
}

export const SolanaPay: React.FunctionComponent<SolanaPayProps> = (props) => {
    const [selectedWallet, setSelectedWallet] = React.useState<PaymentWalletSelection | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const { isPaymentPending, setIsPaymentPending } = useOrderPaymentLockContext();

    const handleWalletSelected = (address: string) => {
        const nextWallet: PaymentWalletSelection = {
            address,
            chain: "solana",
            provider: "Phantom Stub",
        };

        setSelectedWallet(nextWallet);
        props.onWalletSelected?.(nextWallet);
    };

    const handlePay = async () => {
        if (isPaymentPending || isSubmitting || !selectedWallet) {
            return;
        }

        setIsPaymentPending(true);
        setIsSubmitting(true);
        try {
            await props.setTransactionId("solana-tx-stub");
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            setIsPaymentPending(false);
        }
    };

    return (
        <SolanaPayView
            payButton={
                selectedWallet && (
                    <Button
                        className="SolanaButton SolanaButton--payment SolanaButton--main"
                        type="primary"
                        disabled={isSubmitting || isPaymentPending}
                        onClick={handlePay}
                        icon={isSubmitting ? <Spin /> : undefined}
                    >
                        {isSubmitting ? "Loading..." : "Pay"}
                    </Button>
                )
            }
            connectButton={
                <SolanaConnect
                    selectWallet={handleWalletSelected}
                    payment
                    label="Connect"
                    disabled={isSubmitting || isPaymentPending}
                />
            }
            status={isSuccess && <Result title="Payment submitted" subTitle={`Order ID: ${props.model.orderId}`} />}
        />
    );
};
