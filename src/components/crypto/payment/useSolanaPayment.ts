import { useEffect } from "react";
import { useEventCallback } from "usehooks-ts";
import { createTransfer } from "@solana/pay";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import type { SolanaPayProps } from "../SolanaPay";
import { paymentSolanaConnection } from "./constants";
import { getSolanaOrderReference } from "./utils";
import { usePaymentAttempt } from "./usePaymentAttempt";

export const useSolanaPayment = (props: SolanaPayProps) => {
    const wallet = useWallet();
    const onWalletSelected = useEventCallback(props.onWalletSelected);
    const payment = usePaymentAttempt({
        chain: "solana",
        model: props.model,
        saveProof: props.setTransactionId,
        send: async () => {
            if (!wallet.connected) {
                await wallet.connect();
            }
            const transaction = await createTransfer(paymentSolanaConnection, wallet.publicKey!, {
                recipient: new PublicKey(props.model.recipient),
                amount: new BigNumber(props.model.amount.toString()).shiftedBy(-9),
                reference: await getSolanaOrderReference(props.model.orderId),
                memo: "Nswap marketplace payment",
            });
            return wallet.sendTransaction(transaction, paymentSolanaConnection);
        },
        confirm: async (hash) => {
            const result = await paymentSolanaConnection.getSignatureStatuses([hash], {
                searchTransactionHistory: true,
            });
            const status = result.value[0];
            if (!status || status.err || status.confirmationStatus !== "finalized") {
                throw new Error(
                    "The Solana transaction is not finalized successfully. Retry checks the same transaction.",
                );
            }
        },
    });
    const address = wallet.publicKey?.toBase58();
    useEffect(() => {
        if (address && wallet.connected && wallet.wallet?.adapter.name) {
            onWalletSelected?.({ address, chain: "solana", provider: wallet.wallet.adapter.name });
        }
    }, [address, wallet.connected, wallet.wallet?.adapter.name, onWalletSelected]);
    return {
        ...payment,
        canPay: Boolean(address && wallet.connected),
        showConnect:
            !props.preferredWallet ||
            address !== props.preferredWallet.address ||
            wallet.wallet?.adapter.name !== props.preferredWallet.provider,
    };
};
