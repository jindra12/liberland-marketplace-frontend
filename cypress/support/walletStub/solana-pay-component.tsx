import * as React from "react";

import Button from "antd/es/button";
import Result from "antd/es/result";
import Spin from "antd/es/spin";

import { useWallet } from "@solana/wallet-adapter-react";

import { SolanaConnect } from "../../../src/components/crypto/SolanaConnect";
import { useOrderPaymentLockContext } from "../../../src/components/order/OrderPaymentLockContext";
import type { PaymentWalletSelection } from "../../../src/components/order/types";
import { type FormModel } from "../../../src/types";
import { SolanaPayView } from "../../../src/components/crypto/payment/SolanaPayView";

export interface SolanaPayProps {
    setTransactionId: (txId: string) => Promise<void>;
    model: FormModel;
    preferredWallet?: PaymentWalletSelection;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
}

export const SolanaPay: React.FunctionComponent<SolanaPayProps> = (props) => {
    const [selectedWallet, setSelectedWallet] = React.useState<PaymentWalletSelection | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const { connected, publicKey, wallet } = useWallet();
    const { isPaymentPending, setIsPaymentPending } = useOrderPaymentLockContext();
    const publicKeyValue = publicKey?.toBase58();
    const isPreferredWalletSelected = Boolean(
        props.preferredWallet &&
            connected &&
            publicKeyValue &&
            wallet?.adapter.name &&
            props.preferredWallet.address === publicKeyValue &&
            props.preferredWallet.provider === wallet.adapter.name,
    );
    const effectiveWallet = selectedWallet ?? (isPreferredWalletSelected && publicKeyValue && wallet?.adapter.name
        ? {
              address: publicKeyValue,
              chain: "solana",
              provider: wallet.adapter.name,
          }
        : null);
    const showConnectButton = !props.preferredWallet || !isPreferredWalletSelected;

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
        if (isPaymentPending || isSubmitting || !effectiveWallet) {
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
                effectiveWallet && (
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
                showConnectButton ? (
                    <SolanaConnect
                        selectWallet={handleWalletSelected}
                        payment
                        label="Connect"
                        disabled={isSubmitting || isPaymentPending}
                        preferredWallet={props.preferredWallet}
                    />
                ) : undefined
            }
            status={isSuccess && <Result title="Payment submitted" subTitle={`Order ID: ${props.model.orderId}`} />}
        />
    );
};
