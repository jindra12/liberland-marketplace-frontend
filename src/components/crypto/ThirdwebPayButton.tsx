import * as React from "react";

import Avatar from "antd/es/avatar";
import Button from "antd/es/button";
import Flex from "antd/es/flex";
import Spin from "antd/es/spin";
import { mainnet } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

import { thirdwebWallets } from "../../constants";
import { FormModel } from "../../types";
import type { PaymentWalletSelection } from "../order/types";

import { paymentEthereumClient } from "./payment/constants";
import { PaymentAttemptStatus } from "./payment/PaymentAttemptStatus";
import { ThirdwebPayButtonView } from "./payment/ThirdwebPayButtonView";
import { useEthereumPayment } from "./payment/useEthereumPayment";

export interface ThirdwebPayButtonProps {
    formModel: FormModel;
    preferredWallet?: PaymentWalletSelection;
    setTransactionId: (txId: string) => Promise<void>;
    onWalletSelected?: (wallet: PaymentWalletSelection) => void;
}

export const ThirdwebPayButton: React.FunctionComponent<ThirdwebPayButtonProps> = (props) => {
    const payment = useEthereumPayment(props);

    return (
        <ThirdwebPayButtonView
            connectButton={
                payment.showConnect ? (
                    <ConnectButton
                        client={paymentEthereumClient}
                        chain={mainnet}
                        autoConnect={false}
                        wallets={thirdwebWallets.map((w) => createWallet(w))}
                        connectButton={{
                            className: "ThirdwebPay__connect CryptoPaymentGroup__connectButton",
                            label: (
                                <Flex wrap gap="10px" justify="center" align="center">
                                    <Avatar
                                        src="/ethereum.svg"
                                        size={32}
                                        shape="square"
                                        className="ThirdwebPay__ethIcon"
                                    />
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
                payment.canPay && (
                    <Button
                        type="primary"
                        htmlType="button"
                        className="ThirdwebPay ThirdwebPay--payment"
                        onClick={payment.pay}
                        disabled={payment.disabled}
                        icon={payment.pending ? <Spin /> : undefined}
                    >
                        Pay
                    </Button>
                )
            }
            status={
                <PaymentAttemptStatus
                    attempt={payment.attempt}
                    error={payment.error}
                    orderId={props.formModel.orderId}
                />
            }
        />
    );
};
