import * as React from "react";

import { InputNumber } from "antd";
import type { ButtonProps } from "antd";

import { AddToCartSubmitButton } from "./AddToCartSubmitButton";
import { useAddToCartIncrementFormState } from "./hooks";

type AddToCartIncrementFormProps = {
    size?: ButtonProps["size"];
    state: ReturnType<typeof useAddToCartIncrementFormState>;
};

export const AddToCartIncrementForm: React.FunctionComponent<AddToCartIncrementFormProps> = (props) => {
    return (
        <>
            {props.state.hasItemInCart ? (
                <InputNumber
                    min="0"
                    max={props.state.maxAvailable === undefined ? undefined : String(props.state.maxAvailable)}
                    step="1"
                    precision={0}
                    stringMode
                    size={props.size || "large"}
                    className={props.state.quantityInputClassName}
                    disabled={props.state.isMutating}
                    value={props.state.quantityText}
                    onChange={(value) => {
                        props.state.setQuantityText(value === null || value === undefined ? "" : String(value));
                    }}
                    onStep={(value) => {
                        props.state.setQuantityText(String(value));
                        props.state.persistQuantity(Number(value));
                    }}
                    onBlur={(event) => {
                        const typedQuantity = event.currentTarget.value.replace(/[^\d]/g, "");
                        if (event.currentTarget.value.includes("-") || typedQuantity === "") {
                            props.state.resetQuantityDraft(
                                props.state.currentItemQuantity > 0 ? props.state.currentItemQuantity : 1,
                            );
                            return;
                        }

                        props.state.persistQuantity(Number(typedQuantity));
                    }}
                />
            ) : (
                <AddToCartSubmitButton
                    disabled={props.state.isMutating}
                    loading={props.state.isMutating}
                    onClick={() => {
                        props.state.persistQuantity(1);
                    }}
                    size={props.size || "large"}
                    ariaLabel="Add to cart"
                    icon={null}
                >
                    Add to cart
                </AddToCartSubmitButton>
            )}
        </>
    );
};
