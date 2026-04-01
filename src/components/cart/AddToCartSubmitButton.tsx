import * as React from "react";
import { Button } from "antd";
import type { ButtonProps } from "antd";

type AddToCartSubmitButtonProps = {
    ariaLabel?: string;
    disabled: boolean;
    icon?: React.ReactNode;
    loading: boolean;
    size?: ButtonProps["size"];
    text?: string;
};

export const AddToCartSubmitButton: React.FunctionComponent<AddToCartSubmitButtonProps> = ({
    ariaLabel,
    disabled,
    icon,
    loading,
    size,
    text,
}) => {
    return (
        <Button
            type="primary"
            size={size}
            icon={icon}
            htmlType="submit"
            loading={loading}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {text}
        </Button>
    );
};
