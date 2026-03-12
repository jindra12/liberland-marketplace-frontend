import * as React from "react";
import { createThirdwebClient, prepareTransaction } from "thirdweb";
import { ConnectButton, useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";
import { mainnet } from "thirdweb/chains";
import Flex from "antd/es/flex";
import { createWallet } from "thirdweb/wallets";
import Button from "antd/es/button";
import message from "antd/es/message";
import Spin from "antd/es/spin";
import Result from "antd/es/result";
import MoneyCollectOutlined from "@ant-design/icons/MoneyCollectOutlined";
import { FormModel } from "../../types";
import { thirdwebWallets } from "../../constants";
import { useOrderPaymentLockContext } from "../order/OrderPaymentLockContext";

const client = createThirdwebClient({
    clientId: process.env.REACT_APP_THIRDWEB!,
});

export interface ThirdwebPayButtonProps {
    formModel: FormModel;
    setTransactionId: (txId: string) => Promise<void>;
    onPayerAddressSelected?: (address: string) => void;
}

export const ThirdwebPayButton: React.FunctionComponent<ThirdwebPayButtonProps> = (props) => {
    const account = useActiveAccount();
    const { mutateAsync, isPending, isError, isSuccess } = useSendAndConfirmTransaction();
    const { onPayerAddressSelected } = props;
    const { isPaymentPending, setIsPaymentPending } = useOrderPaymentLockContext();

    React.useEffect(() => {
        if (account?.address) {
            onPayerAddressSelected?.(account.address);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address]);

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
            const {
                transactionHash
            } = await mutateAsync(tx);
            await props.setTransactionId(transactionHash);
        } catch (e) {
            console.error(e);
            message.error("Transaction failed");
        } finally {
            setIsPaymentPending(false);
        }
    };

    return (
        <Flex wrap gap="15px" justify="center" align="center" flex={1} className="CryptoPaymentGroup">
            <ConnectButton
                client={client}
                chain={mainnet}
                autoConnect={false}
                wallets={thirdwebWallets.map(w => createWallet(w))}
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
            {isError && (
                <Result title="Payment failed" subTitle={`Order ID: ${props.formModel.orderId}`} />
            )}
        </Flex>
    );
};
