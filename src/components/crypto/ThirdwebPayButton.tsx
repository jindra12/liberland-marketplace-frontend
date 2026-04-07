import * as React from "react";

import MoneyCollectOutlined from "@ant-design/icons/MoneyCollectOutlined";
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

const client = createThirdwebClient({
    clientId: process.env.REACT_APP_THIRDWEB!,
});

export interface ThirdwebPayButtonProps {
    formModel: FormModel;
    setTransactionId: (txId: string) => Promise<void>;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
}

export const ThirdwebPayButton: React.FunctionComponent<ThirdwebPayButtonProps> = (props) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const { mutateAsync, isPending, isError, isSuccess } = useSendAndConfirmTransaction();
    const { isPaymentPending, setIsPaymentPending } = useOrderPaymentLockContext();

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
        <Flex wrap gap="15px" justify="center" align="stretch" flex={1} className="CryptoPaymentGroup">
            <ConnectButton
                client={client}
                chain={mainnet}
                autoConnect={false}
                wallets={thirdwebWallets.map((w) => createWallet(w))}
                connectButton={{
                    className: "ThirdwebPay__connect",
                }}
                detailsButton={{
                    className: "ThirdwebPay__connect",
                }}
            />
            {account && (
                <Button
                    type="primary"
                    htmlType="button"
                    className="ThirdwebPay ThirdwebPay--payment"
                    onClick={onPay}
                    disabled={isPending || isSuccess || isPaymentPending}
                    icon={isPending ? <Spin /> : <MoneyCollectOutlined />}
                >
                    Pay with Ethereum
                </Button>
            )}
            {isError && <Result title="Payment failed" subTitle={`Order ID: ${props.formModel.orderId}`} />}
        </Flex>
    );
};
