import * as React from "react";

import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { ButtonProps, WalletActionButton, WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";
import Button from "antd/es/button";
import message from "antd/es/message";
import Result from "antd/es/result";

import { FormModel } from "../../types";
import { useOrderPaymentLockContext } from "../order/OrderPaymentLockContext";
import type { PaymentWalletSelection } from "../order/types";

import { TronPaymentButtonView } from "./payment/TronPaymentButtonView";

export interface TronPaymentButtonProps {
    formModel: FormModel;
    setTransactionId: (txId: string) => Promise<void>;
    preferredWallet?: PaymentWalletSelection;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
}

export const TronPaymentButton: React.FunctionComponent<TronPaymentButtonProps> = (props) => {
    const { address, connected, signTransaction, wallet } = useWallet();
    const { isPaymentPending, setIsPaymentPending } = useOrderPaymentLockContext();
    const canPay = address && connected && window.tronWeb;
    const isPreferredWalletSelected = Boolean(
        canPay &&
            props.preferredWallet &&
            address === props.preferredWallet.address &&
            wallet?.adapter.name === props.preferredWallet.provider,
    );
    const showConnectButton = !props.preferredWallet || !isPreferredWalletSelected;
    const showPayButton = Boolean(canPay && (!props.preferredWallet || isPreferredWalletSelected));
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (address && connected && wallet?.adapter.name) {
            if (
                props.preferredWallet &&
                (address !== props.preferredWallet.address || wallet.adapter.name !== props.preferredWallet.provider)
            ) {
                return;
            }

            props.onWalletSelected?.({
                address,
                chain: "tron",
                provider: wallet.adapter.name,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, connected, wallet?.adapter.name]);

    const sendPayment = async () => {
        if (isPaymentPending) {
            return;
        }

        if (window.tronWeb && canPay) {
            try {
                setIsPaymentPending(true);
                setLoading(true);
                setErrorMessage(null);
                const amountInSun = props.formModel.amount.toString();
                const unsignedTx = await window.tronWeb.transactionBuilder.sendTrx(
                    props.formModel.recipient,
                    amountInSun as unknown as number,
                    address,
                );
                const signedTx = await signTransaction(unsignedTx);
                const transaction = await window.tronWeb.trx.sendRawTransaction(signedTx);
                await props.setTransactionId(transaction.txid);
            } catch (err) {
                console.error(err);
                const nextErrorMessage = "Transaction failed";
                setErrorMessage(nextErrorMessage);
                message.error(nextErrorMessage);
            } finally {
                setLoading(false);
                setIsPaymentPending(false);
            }
        }
    };
    const buttonProps: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> = {
        type: "button",
        className: "TronButton TronButton--payment",
        disabled: loading || isPaymentPending,
        icon: "/tron.svg",
    };

    return (
        <TronPaymentButtonView
            payButton={
                showPayButton && (
                    <Button
                        type="primary"
                        className="TronButton TronButton--payment"
                        loading={loading}
                        disabled={isPaymentPending}
                        onClick={sendPayment}
                    >
                        Pay
                    </Button>
                )
            }
            connectButton={
                showConnectButton ? (
                    <WalletModalProvider>
                        <WalletActionButton {...buttonProps}>{canPay ? "Connected" : "Connect"}</WalletActionButton>
                    </WalletModalProvider>
                ) : undefined
            }
            status={errorMessage && <Result title="Payment failed" subTitle={`Order ID: ${props.formModel.orderId}`} />}
        />
    );
};
