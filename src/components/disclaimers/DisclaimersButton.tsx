import * as React from "react";

import { FileTextOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { defaultDisclaimerKey } from "./constants";
import { useDisclaimers } from "./context";

type DisclaimersButtonProps = {
    block?: boolean;
    className?: string;
    onClick?: () => void;
};

export const DisclaimersButton: React.FunctionComponent<DisclaimersButtonProps> = (props) => {
    const { openDisclaimers } = useDisclaimers();

    return (
        <Button
            block={props.block}
            className={props.className}
            icon={<FileTextOutlined />}
            onClick={() => {
                openDisclaimers(defaultDisclaimerKey);
                props.onClick?.();
            }}
        >
            Disclaimers
        </Button>
    );
};
