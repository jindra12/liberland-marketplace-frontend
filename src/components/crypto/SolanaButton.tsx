import * as React from "react";

import Button from "antd/es/button";
import Image from "antd/es/image";

export interface SolanaButtonProps {
    onSelect: () => void;
    label?: React.ReactNode;
    payment?: boolean;
    disabled?: boolean;
}

export const SolanaButton: React.FunctionComponent<SolanaButtonProps> = (props) => {
    return (
        <Button
            className={["SolanaButton", props.payment ? "SolanaButton--payment" : undefined].filter(Boolean).join(" ")}
            size="large"
            icon={<Image src={require("../../assets/solana.svg").default} width="22px" height="22px" preview={false} />}
            onClick={props.onSelect}
            disabled={props.disabled}
        >
            {props.label || "Select"}
        </Button>
    );
};
