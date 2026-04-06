import * as React from "react";

import { WalletActionButton } from "@tronweb3/tronwallet-adapter-react-ui";

type TronWalletSelectButtonProps = {
    disabled?: boolean;
    inline?: boolean;
    label?: React.ReactNode;
    onSelectionStart: () => void;
};

export const TronWalletSelectButton: React.FunctionComponent<TronWalletSelectButtonProps> = (props) => {
    return (
        <div onClick={props.disabled ? undefined : props.onSelectionStart}>
            <WalletActionButton className="TronConnect" disabled={props.disabled}>
                {props.label || "Tronweb"}
            </WalletActionButton>
        </div>
    );
};
