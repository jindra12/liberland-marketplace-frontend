import * as React from "react";

import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { WalletModalProvider, WalletActionButton, ButtonProps } from "@tronweb3/tronwallet-adapter-react-ui";
import Flex from "antd/es/flex";
import Grid from "antd/es/grid";
import useToken from "antd/es/theme/useToken";

import { ConnectButtonProps } from "../../types";

export interface TronConnectProps extends ConnectButtonProps {
    inline?: boolean;
    label?: React.ReactNode;
}

export const TronConnect: React.FunctionComponent<TronConnectProps> = (props) => {
    const { address, connected } = useWallet();
    const screens = Grid.useBreakpoint();
    const stackButtons = !screens.lg;

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
        icon: "/tron.svg",
    };

    const button = <WalletActionButton {...buttonProps}>{props.inline ? props.label || "Tronweb" : "Select"}</WalletActionButton>;

    return (
        <WalletModalProvider>
            {props.inline ? (
                button
            ) : (
                <Flex vertical={stackButtons} wrap={!stackButtons} gap="15px" justify="center" align="center" flex={1}>
                    {button}
                </Flex>
            )}
        </WalletModalProvider>
    );
};
