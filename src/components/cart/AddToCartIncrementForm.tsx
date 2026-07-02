import * as React from "react";

import { Form, InputNumber } from "antd";
import type { ButtonProps, FormInstance } from "antd";

import { ProductParameterSelectionFieldList } from "../productParameters/ProductParameterSelectionFieldList";
import type { ProductParameterSource } from "../productParameters/types";

import { AddToCartSubmitButton } from "./AddToCartSubmitButton";
import { useAddToCartIncrementFormState } from "./hooks";

type AddToCartIncrementFormProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
    isAuthenticated?: boolean;
    form: FormInstance;
    parameters?: ProductParameterSource[] | null;
};

export const AddToCartIncrementForm: React.FunctionComponent<AddToCartIncrementFormProps> = (props) => {
    const state = useAddToCartIncrementFormState({
        productId: props.productId,
        variantId: props.variantId,
        serverURL: props.serverURL,
        maxAvailable: props.maxAvailable,
        isAuthenticated: props.isAuthenticated,
        form: props.form,
        parameters: props.parameters,
        size: props.size,
    });

    return (
        <Form
            component={false}
            className={state.formClassName}
            form={props.form}
            initialValues={{
                quantity: 1,
                parameters: state.parameterFormValues,
            }}
            onValuesChange={(changedValues) => {
                if (!("parameters" in changedValues) || !state.hasItemInCart) {
                    return;
                }

                state.persistQuantity(state.currentItemQuantity);
            }}
        >
            {state.messageContextHolder}
            <ProductParameterSelectionFieldList parameters={state.parameterDefinitions} />
            {state.hasItemInCart ? (
                <InputNumber
                    min="0"
                    max={state.maxAvailable === undefined ? undefined : String(state.maxAvailable)}
                    step="1"
                    precision={0}
                    stringMode
                    size={props.size || "large"}
                    className={state.quantityInputClassName}
                    disabled={state.isMutating}
                    value={state.quantityText}
                    onChange={(value) => {
                        state.setQuantityText(value === null || value === undefined ? "" : String(value));
                    }}
                    onStep={(value) => {
                        state.setQuantityText(String(value));
                        state.persistQuantity(Number(value));
                    }}
                    onBlur={(event) => {
                        const typedQuantity = event.currentTarget.value.replace(/[^\d]/g, "");
                        if (event.currentTarget.value.includes("-") || typedQuantity === "") {
                            state.resetQuantityDraft(state.currentItemQuantity > 0 ? state.currentItemQuantity : 1);
                            return;
                        }

                        state.persistQuantity(Number(typedQuantity));
                    }}
                />
            ) : (
                <AddToCartSubmitButton
                    disabled={state.isMutating}
                    loading={state.isMutating}
                    onClick={() => {
                        state.persistQuantity(1);
                    }}
                    size={props.size || "large"}
                    ariaLabel="Add to cart"
                    icon={null}
                >
                    Add to cart
                </AddToCartSubmitButton>
            )}
        </Form>
    );
};
