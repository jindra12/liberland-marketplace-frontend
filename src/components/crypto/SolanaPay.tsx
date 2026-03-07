import * as React from "react";
import Image from "antd/es/image";
import Button from "antd/es/button";
import Spin from "antd/es/spin";
import { createTransfer, validateTransfer } from "@solana/pay";
import { BigNumber } from "bignumber.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { Result } from "antd";
import message from "antd/es/message";
import { FormModel } from "../../types";
import { SolanaConnect } from "./SolanaConnect";

export interface SolanaPayProps {
    setTransactionId: (txId: string) => void,
    model: FormModel;
    onPayerAddressSelected?: (address: string) => void;
}

const connection = new Connection(process.env.REACT_APP_HELIUS!, "confirmed");

export const SolanaPay: React.FunctionComponent<SolanaPayProps> = (props) => {
    const [sender, setSender] = React.useState<string>();
    const { sendTransaction, connected, connect } = useWallet();
    const { onPayerAddressSelected } = props;

    React.useEffect(() => {
        if (sender) {
            onPayerAddressSelected?.(sender);
        }
    }, [onPayerAddressSelected, sender]);

    const pay = useMutation({
        mutationKey: ["onpay"],
        mutationFn: async () => {
            try {
                if (!connected) {
                    await connect();
                }
                const recipient = new PublicKey(props.model.recipient);
                const amount = BigNumber(props.model.amount);
                const message = "LiberStake transfer from Solana";
                const transaction = await createTransfer(
                    connection,
                    new PublicKey(sender!),
                    {
                        recipient,
                        amount,
                        reference: new PublicKey(props.model.orderId),
                        memo: message,
                    },
                );
                const signature = await sendTransaction(
                    transaction,
                    connection,
                );
                const latestBlockhash = await connection.getLatestBlockhash();
                await connection.confirmTransaction(
                    {
                        signature,
                        blockhash: latestBlockhash.blockhash,
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                    },
                    "confirmed",
                );
    
                await validateTransfer(connection, signature, {
                    recipient: new PublicKey(props.model.recipient),
                    amount: new BigNumber(amount) as any,
                    reference: new PublicKey(props.model.orderId)
                })
                props.setTransactionId(signature);
            } catch (e) {
                console.error(e);
                message.error("Transaction failed");
                throw e;
            }
        }
    });
    return (
        <>
            {sender && !pay.isError && (
                <Button
                    icon={pay.isPending
                        ? <Spin />
                        : <Image src={require("../../assets/solana.svg").default} width="22px" height="22px" preview={false} />}
                    className="SolanaButton SolanaButton--payment SolanaButton--main"
                    type="primary"
                    disabled={pay.isPending || pay.isSuccess}
                    onClick={() => pay.mutate()}
                >
                    {pay.isPending ? "Loading..." : "Pay"}
                </Button>
            )}
            {pay.isError && (
                <Result title="Payment failed" subTitle={`Order ID: ${props.model.orderId}`} />
            )}
            <SolanaConnect
                selectWallet={(address) => setSender(address)}
                payment
                label="Connect wallet"
            />
        </>
    );
};
