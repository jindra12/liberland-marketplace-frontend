import * as React from "react";

import Image from "antd/es/image";

import { optionsProps } from "../../constants";
import { Chains } from "../../types";

export interface RecipientIconProps {
    chain: Chains;
    size?: number;
}

export const RecipientIcon: React.FunctionComponent<RecipientIconProps> = (props) => {
    const width = props.size ? `${props.size}px` : optionsProps.width;
    const height = props.size ? `${props.size}px` : optionsProps.height;
    const sizes = { width, height };
    const modifiedProps = {
        ...optionsProps,
        ...sizes,
    };
    switch (props.chain) {
        case "Ethereum":
            return <Image src="/ethereum.svg" {...modifiedProps} />;
        case "Solana":
            return <Image src="/solana.svg" {...modifiedProps} />;
        case "Tron":
            return <Image src="/tron.svg" {...modifiedProps} />;
    }
};
