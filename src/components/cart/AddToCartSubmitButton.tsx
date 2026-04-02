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
export const AddToCartSubmitButton: React.FunctionComponent<AddToCartSubmitButtonProps> = (props) => {
    return (
        <Button type="primary" size={props.size} icon={props.icon} htmlType="submit" loading={props.loading} disabled={props.disabled} aria-label={props.ariaLabel}>
            {props.text}
        </Button>
    );
};
