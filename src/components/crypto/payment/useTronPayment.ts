import { useEffect } from "react";
import { useEventCallback } from "usehooks-ts";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import type { TronPaymentButtonProps } from "../TronPaymentButton";
import { usePaymentAttempt } from "./usePaymentAttempt";

export const useTronPayment = (props: TronPaymentButtonProps) => {
    const { address, connected, signTransaction, wallet } = useWallet();
    const onWalletSelected = useEventCallback(props.onWalletSelected);
    const payment = usePaymentAttempt({
        chain: "tron",
        model: props.formModel,
        saveProof: props.setTransactionId,
        send: async () => {
            const amount = Number(props.formModel.amount);
            if (!Number.isSafeInteger(amount) || amount <= 0) {
                throw new Error("The TRON payment amount is outside the supported range.");
            }
            const unsigned = await window.tronWeb!.transactionBuilder.sendTrx(
                props.formModel.recipient,
                amount,
                address!,
            );
            const referenced = await window.tronWeb!.transactionBuilder.addUpdateData(
                unsigned,
                props.formModel.orderId,
            );
            const signed = await signTransaction(referenced);
            const broadcast = await window.tronWeb!.trx.sendRawTransaction(signed);
            if (!broadcast.result || !broadcast.txid || broadcast.txid !== signed.txID) {
                throw new Error("The TRON network rejected the payment. No proof was saved.");
            }
            return broadcast.txid;
        },
        confirm: async (hash) => {
            const transaction = await window.tronWeb!.trx.getConfirmedTransaction(hash);
            if (
                transaction.txID !== hash ||
                !transaction.ret?.length ||
                transaction.ret.some((result) => result.contractRet !== "SUCCESS")
            ) {
                throw new Error(
                    "The TRON transaction is not confirmed successfully. Retry checks the same transaction.",
                );
            }
        },
    });
    useEffect(() => {
        if (address && connected && wallet?.adapter.name) {
            onWalletSelected?.({ address, chain: "tron", provider: wallet.adapter.name });
        }
    }, [address, connected, wallet?.adapter.name, onWalletSelected]);
    const canPay = Boolean(address && connected && window.tronWeb);
    return {
        ...payment,
        canPay,
        showConnect:
            !props.preferredWallet ||
            address !== props.preferredWallet.address ||
            wallet?.adapter.name !== props.preferredWallet.provider,
    };
};
