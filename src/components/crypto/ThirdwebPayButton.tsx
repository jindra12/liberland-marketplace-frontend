import * as React from "react";
import { createThirdwebClient, prepareTransaction, toWei } from "thirdweb";
import { ConnectButton, useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";
import { mainnet } from "thirdweb/chains";
import truncate from "lodash-es/truncate";
import Flex from "antd/es/flex";
import { createWallet } from "thirdweb/wallets";
import Button from "antd/es/button";
import message from "antd/es/message";
import Spin from "antd/es/spin";
import MoneyCollectOutlined from "@ant-design/icons/MoneyCollectOutlined";
import { FormModel } from "../../types";
import { thirdwebWallets } from "../../constants";

const client = createThirdwebClient({
    clientId: process.env.REACT_APP_THIRDWEB!,
});

export interface ThirdwebPayButtonProps {
    formModel: FormModel;
    setTransactionId: (txId: string) => void;
    onPayerAddressSelected?: (address: string) => void;
}

export const ThirdwebPayButton: React.FunctionComponent<ThirdwebPayButtonProps> = (props) => {
    const account = useActiveAccount();
    const { mutateAsync, isPending, isError, isSuccess } = useSendAndConfirmTransaction();
    const { onPayerAddressSelected } = props;

    React.useEffect(() => {
        if (account?.address) {
            onPayerAddressSelected?.(account.address);
        }
    }, [account?.address, onPayerAddressSelected]);

    const onPay = async () => {
        try {
            const tx = prepareTransaction({
                chain: mainnet,
                client,
                to: props.formModel.recipient,
                value: toWei(props.formModel.amount),
            });
            const {
                transactionHash
            } = await mutateAsync(tx);
            props.setTransactionId(transactionHash);
        } catch (e) {
            console.error(e);
            message.error("Transaction failed");
        }
    };

    return (
        <Flex wrap gap="15px" justify="center" align="center" flex={1}>
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
                    disabled={isPending || isError || isSuccess}
                    icon={isPending ? <Spin /> : <MoneyCollectOutlined />}
                >
                    Pay with {truncate(account.address)}
                </Button>
            )}
        </Flex>
    );
};
