import { useEffect } from "react";
import { useEventCallback } from "usehooks-ts";
import { prepareTransaction } from "thirdweb";
import { mainnet } from "thirdweb/chains";
import { useActiveAccount, useActiveWallet, useSendTransaction } from "thirdweb/react";
import { eth_getTransactionReceipt, getRpcClient } from "thirdweb/rpc";
import { isHex, toHex } from "thirdweb/utils";
import type { ThirdwebPayButtonProps } from "../ThirdwebPayButton";
import { paymentEthereumClient } from "./constants";
import { usePaymentAttempt } from "./usePaymentAttempt";

export const useEthereumPayment = (props: ThirdwebPayButtonProps) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const transaction = useSendTransaction();
    const onWalletSelected = useEventCallback(props.onWalletSelected);
    const payment = usePaymentAttempt({
        chain: "ethereum",
        model: props.formModel,
        saveProof: props.setTransactionId,
        send: async () => {
            const result = await transaction.mutateAsync(
                prepareTransaction({
                    chain: mainnet,
                    client: paymentEthereumClient,
                    data: toHex(props.formModel.orderId),
                    to: props.formModel.recipient,
                    value: props.formModel.amount,
                }),
            );
            return result.transactionHash;
        },
        confirm: async (hash) => {
            if (!isHex(hash)) {
                throw new Error("The wallet returned an invalid Ethereum transaction hash.");
            }
            const receipt = await eth_getTransactionReceipt(
                getRpcClient({ client: paymentEthereumClient, chain: mainnet }),
                { hash },
            );
            if (receipt.status !== "success") {
                throw new Error(
                    "The Ethereum transaction did not succeed. Do not send it again; review the transaction.",
                );
            }
        },
    });
    useEffect(() => {
        if (account?.address && wallet?.id) {
            onWalletSelected?.({ address: account.address, chain: "ethereum", provider: wallet.id });
        }
    }, [account?.address, wallet?.id, onWalletSelected]);
    return {
        ...payment,
        canPay: Boolean(account),
        showConnect:
            !props.preferredWallet ||
            account?.address !== props.preferredWallet.address ||
            wallet?.id !== props.preferredWallet.provider,
    };
};
