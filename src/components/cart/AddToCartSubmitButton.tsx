import * as React from "react";

import { Button } from "antd";
import type { ButtonProps } from "antd";

type AddToCartSubmitButtonProps = {
    ariaLabel?: string;
    disabled: boolean;
    icon?: React.ReactNode;
    loading: boolean;
    onClick: () => void;
    size?: ButtonProps["size"];
};
export const AddToCartSubmitButton: React.FunctionComponent<AddToCartSubmitButtonProps> = (props) => {
    return (
        <Button
            type="primary"
            size={props.size}
            className="AddToCartButton__submit"
            icon={props.icon}
            htmlType="button"
            loading={props.loading}
            disabled={props.disabled}
            aria-label={props.ariaLabel}
            onClick={props.onClick}
        >
        </Button>
    );
};
