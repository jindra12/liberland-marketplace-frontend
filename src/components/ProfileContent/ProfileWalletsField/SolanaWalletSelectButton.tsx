import * as React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { SolanaButton } from "../../crypto/SolanaButton";

type SolanaWalletSelectButtonProps = {
    disabled?: boolean;
    onSelectionStart: () => void;
};

export const SolanaWalletSelectButton: React.FunctionComponent<SolanaWalletSelectButtonProps> = (props) => {
    const { setVisible } = useWalletModal();
    const { connected, disconnect, select } = useWallet();

    const handleSelect = async () => {
        props.onSelectionStart();

        if (connected) {
            await disconnect();
        }

        select(null);
        setVisible(true);
    };

    return <SolanaButton disabled={props.disabled} label="Select wallet" onSelect={handleSelect} />;
};
