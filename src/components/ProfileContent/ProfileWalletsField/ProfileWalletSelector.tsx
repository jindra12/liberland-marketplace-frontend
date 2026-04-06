import * as React from "react";

import { Button } from "antd";

import { UserUpdate_Wallets_Chain_MutationInput } from "../../../generated/graphql";
import type { ProfileWalletSelection } from "../types";

import { EthereumWalletSelectButton } from "./EthereumWalletSelectButton";
import { SolanaWalletSelectButton } from "./SolanaWalletSelectButton";
import { SolanaWalletSelectionObserver } from "./SolanaWalletSelectionObserver";
import { TronWalletSelectButton } from "./TronWalletSelectButton";
import { TronWalletSelectionObserver } from "./TronWalletSelectionObserver";

type ProfileWalletSelectorProps = {
    chain?: UserUpdate_Wallets_Chain_MutationInput | null;
    disabled?: boolean;
    isSelecting: boolean;
    inline?: boolean;
    label?: React.ReactNode;
    onSelectionStart: () => void;
    onWalletSelected: (wallet: ProfileWalletSelection) => void;
};

export const ProfileWalletSelector: React.FunctionComponent<ProfileWalletSelectorProps> = (props) => {
    if (props.chain === UserUpdate_Wallets_Chain_MutationInput.Ethereum) {
        return (
            <EthereumWalletSelectButton
                disabled={props.disabled}
                inline={props.inline}
                label={props.label}
                onWalletSelected={props.onWalletSelected}
            />
        );
    }

    if (props.chain === UserUpdate_Wallets_Chain_MutationInput.Solana) {
        return (
            <>
                <SolanaWalletSelectButton
                    disabled={props.disabled}
                    inline={props.inline}
                    label={props.label}
                    onSelectionStart={props.onSelectionStart}
                />
                <SolanaWalletSelectionObserver active={props.isSelecting} onWalletSelected={props.onWalletSelected} />
            </>
        );
    }

    if (props.chain === UserUpdate_Wallets_Chain_MutationInput.Tron) {
        return (
            <>
                <TronWalletSelectButton
                    disabled={props.disabled}
                    inline={props.inline}
                    label={props.label}
                    onSelectionStart={props.onSelectionStart}
                />
                <TronWalletSelectionObserver active={props.isSelecting} onWalletSelected={props.onWalletSelected} />
            </>
        );
    }

    return <Button disabled>{props.label || "Select wallet"}</Button>;
};
