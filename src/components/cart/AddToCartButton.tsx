import * as React from "react";

import { ConfigProvider, Divider, Form, Space } from "antd";
import type { ButtonProps } from "antd";

import type { MeUserQuery } from "../../generated/graphql";
import { ProductParameterSelectionFieldList } from "../productParameters/ProductParameterSelectionFieldList";
import type { ProductParameterSource } from "../productParameters/types";

import { AddToCartIncrementForm } from "./AddToCartIncrementForm";
import { BuyNowButton } from "./BuyNowButton/BuyNowButton";
import { useCartMutationContext } from "./CartMutationContext";
import { useAddToCartButtonState, useAddToCartIncrementFormState } from "./hooks";

type AddToCartButtonProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    block?: boolean;
    hideBuyNowButton?: boolean;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
    isAuthenticated?: boolean;
    me: MeUserQuery[];
    parameters?: ProductParameterSource[] | null;
};
export const AddToCartButton: React.FunctionComponent<AddToCartButtonProps> = (props) => {
    const [form] = Form.useForm();
    const { isMutating } = useCartMutationContext();
    const addToCartIncrementState = useAddToCartIncrementFormState({
        productId: props.productId,
        variantId: props.variantId,
        serverURL: props.serverURL,
        maxAvailable: props.maxAvailable,
        isAuthenticated: props.isAuthenticated,
        me: props.me,
        parameters: props.parameters,
        size: props.size,
        form,
    });
    const addToCartState = useAddToCartButtonState({
        productId: props.productId,
        variantId: props.variantId,
        serverURL: props.serverURL,
        maxAvailable: props.maxAvailable,
        isAuthenticated: props.isAuthenticated,
        me: props.me,
        parameters: props.parameters,
        block: props.block,
        size: props.size,
        form,
    });
    const shouldHideButton =
        addToCartState.maxAvailable !== undefined &&
        addToCartState.maxAvailable <= 0 &&
        !addToCartState.hasItemInCart;

    if (shouldHideButton) {
        return null;
    }
    return (
        <ConfigProvider
            theme={{
                components: {
                    InputNumber: {
                        handleVisible: true,
                    },
                },
            }}
        >
            <Form
                component={false}
                className={addToCartIncrementState.formClassName}
                form={form}
                initialValues={{
                    quantity: 1,
                    parameters: addToCartIncrementState.parameterFormValues,
                }}
                onValuesChange={(changedValues) => {
                    if (!changedValues.parameters || !addToCartIncrementState.hasItemInCart) {
                        return;
                    }

                    addToCartIncrementState.persistQuantity(addToCartIncrementState.currentItemQuantity);
                }}
            >
                {addToCartIncrementState.messageContextHolder}
                <Space.Compact block={props.block} className={addToCartState.compactClassName}>
                    <AddToCartIncrementForm
                        size={addToCartState.size}
                        state={addToCartIncrementState}
                    />
                    {props.hideBuyNowButton ? null : (
                        <BuyNowButton
                            block={props.block}
                            candidateProfileAddresses={addToCartState.candidateProfileAddressesForBuyNow}
                            disabled={isMutating}
                            form={form}
                            productId={props.productId}
                            quantity={addToCartState.inputQuantity}
                            serverURL={props.serverURL}
                            size={addToCartState.size}
                            variantId={props.variantId}
                            parameters={addToCartState.parameterDefinitions}
                        />
                    )}
                </Space.Compact>
                {addToCartState.parameterDefinitions.length > 0 && (
                    <>
                        <Divider className="AddToCartButton__parametersDivider" />
                        <ProductParameterSelectionFieldList parameters={addToCartState.parameterDefinitions} />
                    </>
                )}
            </Form>
        </ConfigProvider>
    );
};
