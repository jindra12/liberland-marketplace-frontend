import * as React from "react";

import Avatar from "antd/es/avatar";
import Button from "antd/es/button";
import Flex from "antd/es/flex";
import message from "antd/es/message";
import Result from "antd/es/result";
import Spin from "antd/es/spin";
import { createThirdwebClient, prepareTransaction } from "thirdweb";
import { mainnet } from "thirdweb/chains";
import { ConnectButton, useActiveAccount, useActiveWallet, useSendAndConfirmTransaction } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

import { thirdwebWallets } from "../../constants";
import { FormModel } from "../../types";
import { useOrderPaymentLockContext } from "../order/OrderPaymentLockContext";
import type { PaymentWalletSelection } from "../order/types";

import { ThirdwebPayButtonView } from "./payment/ThirdwebPayButtonView";

const client = createThirdwebClient({
    clientId: process.env.REACT_APP_THIRDWEB!,
});

export interface ThirdwebPayButtonProps {
    formModel: FormModel;
    preferredWallet?: PaymentWalletSelection;
    setTransactionId: (txId: string) => Promise<void>;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
}

export const ThirdwebPayButton: React.FunctionComponent<ThirdwebPayButtonProps> = (props) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const { mutateAsync, isPending, isError, isSuccess } = useSendAndConfirmTransaction();
    const { isPaymentPending, setIsPaymentPending } = useOrderPaymentLockContext();
    const isPreferredWalletSelected = Boolean(
        props.preferredWallet &&
            account?.address === props.preferredWallet.address &&
            wallet?.id === props.preferredWallet.provider,
    );
    const showConnectButton = !props.preferredWallet || !isPreferredWalletSelected;
    const showPayButton = Boolean(account);

    React.useEffect(() => {
        if (account?.address && wallet?.id) {
            props.onWalletSelected?.({
                address: account.address,
                chain: "ethereum",
                provider: wallet.id,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address, wallet?.id]);

    const onPay = async () => {
        if (isPaymentPending) {
            return;
        }

        setIsPaymentPending(true);
        try {
            const tx = prepareTransaction({
                chain: mainnet,
                client,
                to: props.formModel.recipient,
                value: props.formModel.amount,
            });
            const { transactionHash } = await mutateAsync(tx);
            await props.setTransactionId(transactionHash);
        } catch (e) {
            console.error(e);
            message.error("Transaction failed");
        } finally {
            setIsPaymentPending(false);
        }
    };

    return (
        <ThirdwebPayButtonView
            connectButton={
                showConnectButton ? (
                <ConnectButton
                    client={client}
                    chain={mainnet}
                    autoConnect={false}
                    wallets={thirdwebWallets.map((w) => createWallet(w))}
                    connectButton={{
                        className: "ThirdwebPay__connect CryptoPaymentGroup__connectButton",
                        label: (
                            <Flex wrap gap="10px" justify="center" align="center">
                                <Avatar src="/ethereum.svg" size={32} shape="square" className="ThirdwebPay__ethIcon" />
                                Connect
                            </Flex>
                        ),
                    }}
                    detailsButton={{
                        className: "ThirdwebPay__connect CryptoPaymentGroup__connectButton",
                    }}
                />
                ) : undefined
            }
            payButton={
                showPayButton && (
                    <Button
                        type="primary"
                        htmlType="button"
                        className="ThirdwebPay ThirdwebPay--payment"
                        onClick={onPay}
                        disabled={isPending || isSuccess || isPaymentPending}
                        icon={isPending ? <Spin /> : undefined}
                    >
                        Pay
                    </Button>
                )
            }
            status={isError && <Result title="Payment failed" subTitle={`Order ID: ${props.formModel.orderId}`} />}
        />
    );
};
