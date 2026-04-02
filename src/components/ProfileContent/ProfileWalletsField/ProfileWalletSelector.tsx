import * as React from "react";
import { Button } from "antd";
import { UserUpdate_Wallets_Chain_MutationInput } from "../../../generated/graphql";
import type { ProfileWalletSelection } from "../types";
import { EthereumWalletSelectButton } from "./EthereumWalletSelectButton";
import { SolanaWalletSelectionObserver } from "./SolanaWalletSelectionObserver";
import { SolanaWalletSelectButton } from "./SolanaWalletSelectButton";
import { TronWalletSelectionObserver } from "./TronWalletSelectionObserver";
import { TronWalletSelectButton } from "./TronWalletSelectButton";

type ProfileWalletSelectorProps = {
    chain?: UserUpdate_Wallets_Chain_MutationInput | null;
    disabled?: boolean;
    isSelecting: boolean;
    onSelectionStart: () => void;
    onWalletSelected: (wallet: ProfileWalletSelection) => void;
};

export const ProfileWalletSelector: React.FunctionComponent<ProfileWalletSelectorProps> = (props) => {
    if (props.chain === UserUpdate_Wallets_Chain_MutationInput.Ethereum) {
        return <EthereumWalletSelectButton disabled={props.disabled} onWalletSelected={props.onWalletSelected} />;
    }

    if (props.chain === UserUpdate_Wallets_Chain_MutationInput.Solana) {
        return (
            <>
                <SolanaWalletSelectButton disabled={props.disabled} onSelectionStart={props.onSelectionStart} />
                <SolanaWalletSelectionObserver active={props.isSelecting} onWalletSelected={props.onWalletSelected} />
            </>
        );
    }

    if (props.chain === UserUpdate_Wallets_Chain_MutationInput.Tron) {
        return (
            <>
                <TronWalletSelectButton disabled={props.disabled} onSelectionStart={props.onSelectionStart} />
                <TronWalletSelectionObserver active={props.isSelecting} onWalletSelected={props.onWalletSelected} />
            </>
        );
    }

    return <Button disabled>Select wallet</Button>;
};
