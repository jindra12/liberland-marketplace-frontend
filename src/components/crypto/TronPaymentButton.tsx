import * as React from "react";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import Button from "antd/es/button";
import Image from "antd/es/image";
import { ButtonProps, WalletActionButton, WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";
import Flex from "antd/es/flex";
import message from "antd/es/message";
import Result from "antd/es/result";
import { FormModel } from "../../types";

export interface TronPaymentButtonProps {
    formModel: FormModel;
    setTransactionId: (txId: string) => void;
    onPayerAddressSelected?: (address: string) => void;
}

export const TronPaymentButton: React.FunctionComponent<TronPaymentButtonProps> = (props) => {
    const { address, connected, signTransaction } = useWallet();
    const canPay = address && connected && window.tronWeb;
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (address && connected) {
            props.onPayerAddressSelected?.(address);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, connected]);

    const sendPayment = async () => {
        if (window.tronWeb && canPay) {
            try {
                setLoading(true);
                setErrorMessage(null);
                const amountInSun = window.tronWeb.toSun(Number(props.formModel.amount));
                const unsignedTx = await window.tronWeb.transactionBuilder.sendTrx(
                    props.formModel.recipient,
                    Number(amountInSun),
                    address,
                );
                const signedTx = await signTransaction(unsignedTx);
                const transaction = await window.tronWeb.trx.sendRawTransaction(signedTx);
                props.setTransactionId(transaction.txid);
            } catch (err) {
                console.error(err);
                const nextErrorMessage = "Transaction failed";
                setErrorMessage(nextErrorMessage);
                message.error(nextErrorMessage);
            } finally {
                setLoading(false);
            }
        }
    };
    const buttonProps: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> = {
        type: "button",
        className: "TronButton TronButton--payment",
        disabled: loading,
        icon: require("../../assets/tron.svg").default,
    };

    return (
        <Flex
            wrap
            gap="15px"
            justify="center"
            align="center"
            flex={1}
            className="TronwebModal TronwebModal--payment"
        >
            {canPay && (
                <Button
                    icon={<Image src={require("../../assets/tron.svg").default} width="22px" height="22px" preview={false} />}
                    className="TronButton TronButton--payment TronButton--main"
                    loading={loading}
                    onClick={sendPayment}
                >
                    Pay
                </Button>
            )}
            <WalletModalProvider>
                <WalletActionButton {...buttonProps}>
                    {canPay ? "Connected" : "Connect"}
                </WalletActionButton>
            </WalletModalProvider>
            {errorMessage && (
                <Result title="Payment failed" subTitle={`Order ID: ${props.formModel.orderId}`} />
            )}
        </Flex>
    );
};
