import * as React from "react";
import { message } from "antd";
import { WalletError } from "@tronweb3/tronwallet-abstract-adapter";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";
import { WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";

import * as Adapters from "./tronWallets";

const adapters = Object.values(Adapters).map((Adapter) => new Adapter());

export const TronContext: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [messageApi, contextHolder] = message.useMessage();
    const onTronError = (error: WalletError) => {
        messageApi.error(error.message);
    };

    return (
        <WalletProvider adapters={adapters} onError={onTronError} autoConnect={false}>
            {contextHolder}
            <WalletModalProvider>{props.children}</WalletModalProvider>
        </WalletProvider>
    );
};
