import * as React from "react";

import { useMutation } from "@tanstack/react-query";

import { createTransfer } from "@solana/pay";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Result } from "antd";
import Button from "antd/es/button";
import message from "antd/es/message";
import Spin from "antd/es/spin";
import { BigNumber } from "bignumber.js";

import { FormModel } from "../../types";
import { useOrderPaymentLockContext } from "../order/OrderPaymentLockContext";
import type { PaymentWalletSelection } from "../order/types";

import { SolanaPayView } from "./payment/SolanaPayView";
import { SolanaConnect } from "./SolanaConnect";

export interface SolanaPayProps {
    setTransactionId: (txId: string) => Promise<void>;
    model: FormModel;
    preferredWallet?: PaymentWalletSelection;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
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

const connection = new Connection(process.env.REACT_APP_HELIUS!, "finalized");

export const SolanaPay: React.FunctionComponent<SolanaPayProps> = (props) => {
    const [sender, setSender] = React.useState<string>();
    const { sendTransaction, connected, connect, wallet } = useWallet();
    const { isPaymentPending, setIsPaymentPending } = useOrderPaymentLockContext();
    const isPreferredWalletSelected = Boolean(
        sender &&
            wallet?.adapter.name &&
            props.preferredWallet &&
            sender === props.preferredWallet.address &&
            wallet.adapter.name === props.preferredWallet.provider,
    );
    const showConnectButton = !props.preferredWallet || !isPreferredWalletSelected;
    const showPayButton = Boolean(sender);

    React.useEffect(() => {
        if (sender && wallet?.adapter.name) {
            props.onWalletSelected?.({
                address: sender,
                chain: "solana",
                provider: wallet.adapter.name,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sender, wallet?.adapter.name]);

    const pay = useMutation({
        mutationKey: ["onpay"],
        mutationFn: async () => {
            if (isPaymentPending) {
                return;
            }

            setIsPaymentPending(true);
            try {
                if (!connected) {
                    await connect();
                }
                const recipient = new PublicKey(props.model.recipient);
                const amount = new BigNumber(props.model.amount.toString()).div("1000000000");
                const reference = await getSolanaOrderReference(props.model.orderId);
                const message = "LiberStake transfer from Solana";
                const transaction = await createTransfer(connection, new PublicKey(sender!), {
                    recipient,
                    amount,
                    reference,
                    memo: message,
                });
                const signature = await sendTransaction(transaction, connection);
                const latestBlockhash = await connection.getLatestBlockhash();
                await connection.confirmTransaction(
                    {
                        signature,
                        blockhash: latestBlockhash.blockhash,
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                    },
                    "finalized",
                );
                await props.setTransactionId(signature);
            } catch (e) {
                console.error(e);
                message.error("Transaction failed");
                throw e;
            } finally {
                setIsPaymentPending(false);
            }
        },
    });
    return (
        <SolanaPayView
            payButton={
                showPayButton && (
                    <Button
                        icon={pay.isPending ? <Spin /> : undefined}
                        className="SolanaButton SolanaButton--payment"
                        type="primary"
                        disabled={pay.isPending || pay.isSuccess || isPaymentPending}
                        onClick={() => pay.mutate()}
                    >
                        {pay.isPending ? "Loading..." : "Pay"}
                    </Button>
                )
            }
            connectButton={
                showConnectButton ? (
                    <SolanaConnect
                        selectWallet={(address) => setSender(address)}
                        payment
                        label="Connect"
                        disabled={pay.isPending || isPaymentPending}
                        preferredWallet={props.preferredWallet}
                    />
                ) : undefined
            }
            status={pay.isError && <Result title="Payment failed" subTitle={`Order ID: ${props.model.orderId}`} />}
        />
    );
};
