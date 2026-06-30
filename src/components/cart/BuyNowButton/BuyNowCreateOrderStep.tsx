import * as React from "react";

import { message } from "antd";
import useLocalStorage from "use-local-storage";

import { useCreateOrderMutation } from "../../hooks";
import { SAVED_SHIPPING_ADDRESS_STORAGE_KEY } from "../../order/constants";
import { ShippingAddressSelectModal } from "../../order/ShippingAddressSelectModal";
import type { AddressWithEmail, SubmittedOrder } from "../../order/types";
import { toShippingAddressInput } from "../../order/utils";
import type { ProductParameterSelectionMap, ProductParameterSource } from "../../productParameters/types";
import { buildSelectedProductParametersInput } from "../../productParameters/utils";

import type { BuyNowPreparedPurchase } from "./types";

type BuyNowCreateOrderStepProps = {
    onCancel: () => void;
    onOrderCreated: (submittedOrder: SubmittedOrder) => void;
    productId: string;
    parameters?: ProductParameterSource[] | null;
    purchase: BuyNowPreparedPurchase;
    quantity: number;
    selectedParameterKeys: ProductParameterSelectionMap;
    serverURL: string;
    variantId?: string;
};

export const BuyNowCreateOrderStep: React.FunctionComponent<BuyNowCreateOrderStepProps> = (props) => {
    const createOrderMutation = useCreateOrderMutation();
    const [messageApi, contextHolder] = message.useMessage();
    const [shippingAddress, setShippingAddress] = useLocalStorage<AddressWithEmail | undefined>(
        SAVED_SHIPPING_ADDRESS_STORAGE_KEY,
        props.purchase.candidateProfileAddresses.length === 1 ? props.purchase.candidateProfileAddresses[0] : undefined,
    );

    React.useEffect(() => {
        if (shippingAddress) {
            const selectedParameters = buildSelectedProductParametersInput(
                props.parameters,
                props.selectedParameterKeys,
            );
            createOrderMutation.mutate({
                url: props.serverURL,
                draft: false,
                data: {
                    customerEmail: shippingAddress.email,
                    items: [
                        {
                            quantity: props.quantity,
                            product: props.productId,
                            variant: props.variantId,
                            ...(selectedParameters !== undefined && {
                                parameters: selectedParameters,
                            }),
                        },
                    ],
                    shippingAddress: toShippingAddressInput(shippingAddress),
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        props.parameters,
        props.productId,
        props.quantity,
        props.selectedParameterKeys,
        props.serverURL,
        props.variantId,
        shippingAddress,
    ]);

    React.useEffect(() => {
        if (createOrderMutation.isError) {
            messageApi.error("Could not create your order, try adding item to cart instead");
            props.onCancel();
        }
        if (createOrderMutation.data) {
            message.success("Order created successfully!");
            props.onOrderCreated({
                order: createOrderMutation.data.createOrder!,
                url: props.serverURL,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createOrderMutation]);

    return (
        <>
            {contextHolder}
            <ShippingAddressSelectModal
                open={!shippingAddress}
                loading={createOrderMutation.isPending}
                options={props.purchase.candidateProfileAddresses}
                selectedKey={shippingAddress?.id}
                onCancel={props.onCancel}
                onSelect={(id) => {
                    setShippingAddress(props.purchase.candidateProfileAddresses.find((address) => address.id === id));
                }}
            />
        </>
    );
};
