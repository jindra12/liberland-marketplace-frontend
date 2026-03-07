import * as React from "react";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import Button from "antd/es/button";
import Image from "antd/es/image";
import truncate from "lodash-es/truncate";
import { ButtonProps, WalletActionButton, WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";
import Flex from "antd/es/flex";
import message from "antd/es/message";
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
    const { onPayerAddressSelected } = props;

    React.useEffect(() => {
        if (address && connected) {
            onPayerAddressSelected?.(address);
        }
    }, [address, connected, onPayerAddressSelected]);

    const sendPayment = async () => {
        if (window.tronWeb && canPay) {
            try {
                setLoading(true);
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
                message.error("Transaction failed");
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
        <Flex wrap gap="15px" justify="center" align="center" flex={1} className="TronwebModal TronwebModal--payment">
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
                    {canPay ? `Connected: ${truncate(address, { length: 10 })}` : "Connect"}
                </WalletActionButton>
            </WalletModalProvider>
        </Flex>
    );
};
