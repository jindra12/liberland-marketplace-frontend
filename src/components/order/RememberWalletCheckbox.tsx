import * as React from "react";

import { Checkbox } from "antd";

type RememberWalletCheckboxProps = {
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
};

export const RememberWalletCheckbox: React.FunctionComponent<RememberWalletCheckboxProps> = (props) => {
    return (
        <Checkbox
            checked={props.checked}
            disabled={props.disabled}
            onChange={(event) => props.onChange(event.target.checked)}
        >
            Remember this wallet for future payments
        </Checkbox>
    );
};
