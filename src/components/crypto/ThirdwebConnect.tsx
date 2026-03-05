import * as React from "react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { mainnet } from "thirdweb/chains";
import Flex from "antd/es/flex";
import useToken from "antd/es/theme/useToken";
import { createWallet } from "thirdweb/wallets";
import { ConnectButtonProps } from "../../types";
import { RecipientIcon } from "./RecipientIcon";
import { thirdwebWallets } from "../../constants";

const client = createThirdwebClient({
    clientId: process.env.REACT_APP_THRIDWEB!,
});

export const ThirdwebConnect: React.FunctionComponent<ConnectButtonProps> = (props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = useToken();
    const account = useActiveAccount();

    React.useEffect(() => {
        if (account?.address) {
            props.selectWallet(account.address);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address]);

    const btnStyle: React.CSSProperties = {
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
        border: `1px solid ${token.colorBorder}`,
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
        borderTopRightRadius: token.borderRadius,
        borderBottomRightRadius: token.borderRadius,
        fontSize: token.fontSizeLG,
        padding: "6.4px 15px",
        height: "50px",
        lineHeight: "22px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        minWidth: "0",
    };

    return (
        <ConnectButton
            client={client}
            chain={mainnet}
            detailsButton={{
                style: btnStyle,
            }}
            autoConnect={false}
            wallets={thirdwebWallets.map(w => createWallet(w))}
            connectButton={{
                label: (
                    <Flex wrap gap="10px" justify="center" align="center">
                        <RecipientIcon chain="Ethereum" size={22} />
                        Select
                    </Flex>
                ),
                style: btnStyle,
                className: "",
            }}
        />
    );
};
