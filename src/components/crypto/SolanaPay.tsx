import * as React from "react";
import Image from "antd/es/image";
import Button from "antd/es/button";
import Spin from "antd/es/spin";
import Flex from "antd/es/flex";
import { createTransfer } from "@solana/pay";
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

const toOrderReferenceSeed = async (orderId: string): Promise<Uint8Array> => {
    const encoded = new TextEncoder().encode(orderId);
    const digest = await window.crypto.subtle.digest("SHA-256", encoded);
    return new Uint8Array(digest);
};

const getSolanaOrderReference = async (orderId: string): Promise<PublicKey> => {
    const seed = await toOrderReferenceSeed(orderId);
    return new PublicKey(seed);
};


const connection = new Connection(process.env.REACT_APP_HELIUS!, "confirmed");

export const SolanaPay: React.FunctionComponent<SolanaPayProps> = (props) => {
    const [sender, setSender] = React.useState<string>();
    const { sendTransaction, connected, connect } = useWallet();

    React.useEffect(() => {
        if (sender) {
            props.onPayerAddressSelected?.(sender);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sender]);

    const pay = useMutation({
        mutationKey: ["onpay"],
        mutationFn: async () => {
            try {
                if (!connected) {
                    await connect();
                }
                const recipient = new PublicKey(props.model.recipient);
                // @solana/pay native SOL transfers allow max 9 decimal places.
                const amount = BigNumber(props.model.amount).decimalPlaces(9, BigNumber.ROUND_DOWN);
                const reference = await getSolanaOrderReference(props.model.orderId);
                const message = "LiberStake transfer from Solana";
                const transaction = await createTransfer(
                    connection,
                    new PublicKey(sender!),
                    {
                        recipient,
                        amount,
                        reference,
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
            <Flex wrap gap="15px" justify="center" align="center">
                {sender && (
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
                <SolanaConnect
                    selectWallet={(address) => setSender(address)}
                    payment
                    label="Connect wallet"
                />
            </Flex>
            {pay.isError && (
                <Result title="Payment failed" subTitle={`Order ID: ${props.model.orderId}`} />
            )}
        </>
    );
};
