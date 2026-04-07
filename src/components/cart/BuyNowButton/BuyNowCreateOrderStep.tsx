import * as React from "react";

import { Button, Empty, message, Modal } from "antd";
import useLocalStorage from "use-local-storage";

import { RouteButton } from "../../RouteButton";
import { useCreateOrderMutation } from "../../hooks";
import { SAVED_SHIPPING_ADDRESS_STORAGE_KEY } from "../../order/constants";
import { ShippingAddressSelectModal } from "../../order/ShippingAddressSelectModal";
import type { AddressWithEmail, SubmittedOrder } from "../../order/types";
import { toShippingAddressInput } from "../../order/utils";

import type { BuyNowPreparedPurchase } from "./types";

type BuyNowCreateOrderStepProps = {
    onCancel: () => void;
    onOrderCreated: (submittedOrder: SubmittedOrder) => void;
    productId: string;
    purchase: BuyNowPreparedPurchase;
    quantity: number;
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

    if (props.purchase.candidateProfileAddresses.length === 0) {
        return (
            <>
                {contextHolder}
                <Modal
                    open
                    destroyOnHidden
                    title="Choose a default shipping address"
                    onCancel={props.onCancel}
                    footer={[
                        <Button key="cancel" danger onClick={props.onCancel} disabled={createOrderMutation.isPending}>
                            Cancel
                        </Button>,
                        <RouteButton key="profile" type="primary" to="/profile">
                            Go to profile
                        </RouteButton>,
                    ]}
                    className="BuyNowCreateOrderStep"
                >
                    <Empty description="No default shipping addresses found" />
                </Modal>
            </>
        );
    }

    React.useEffect(() => {
        if (shippingAddress) {
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
                        },
                    ],
                    shippingAddress: toShippingAddressInput(shippingAddress),
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shippingAddress]);

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
