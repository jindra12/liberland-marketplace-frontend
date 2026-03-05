import * as React from "react";
import { WalletModalProvider, WalletActionButton, ButtonProps } from "@tronweb3/tronwallet-adapter-react-ui";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import useToken from "antd/es/theme/useToken";
import { ConnectButtonProps } from "../../types";

export const TronConnect: React.FunctionComponent<ConnectButtonProps> = (props) => {
    const { address, connected } = useWallet();
    React.useEffect(() => {
        if (address && connected) {
            props.selectWallet(address);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, connected]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = useToken();
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
        fontWeight: "normal",
    };
    const buttonProps: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> = {
        type: "button",
        style: btnStyle,
        className: "TronConnect",
        icon: require("../tron.svg").default,
    };

    return (
        <WalletModalProvider>
            <WalletActionButton {...buttonProps}>
                Select
            </WalletActionButton>
        </WalletModalProvider>
    );
};
