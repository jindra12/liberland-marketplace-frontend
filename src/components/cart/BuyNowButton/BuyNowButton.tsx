import * as React from "react";

import { Button, Empty, Modal } from "antd";

import type { AddressWithEmail, SubmittedOrder } from "../../order/types";
import { RouteButton } from "../../RouteButton";

import { BuyNowCreateOrderStep } from "./BuyNowCreateOrderStep";
import { BuyNowPaymentStep } from "./BuyNowPaymentStep";
import type { BuyNowPreparedPurchase } from "./types";

type BuyNowButtonProps = {
    block?: boolean;
    candidateProfileAddresses: AddressWithEmail[];
    disabled?: boolean;
    productId: string;
    quantity: number;
    serverURL: string;
    size?: React.ComponentProps<typeof Button>["size"];
    variantId?: string;
};
export const BuyNowButton: React.FunctionComponent<BuyNowButtonProps> = (props) => {
    const size = props.size === undefined ? "large" : props.size;
    const [preparedPurchase, setPreparedPurchase] = React.useState<BuyNowPreparedPurchase>();
    const [submittedOrders, setSubmittedOrders] = React.useState<SubmittedOrder[]>([]);
    const isBusy = props.disabled || Boolean(preparedPurchase) || submittedOrders.length > 0;
    const handleBuyNow = () => {
        setPreparedPurchase({
            candidateProfileAddresses: props.candidateProfileAddresses,
        });
    };
    const onCancel = () => {
        setPreparedPurchase(undefined);
    };
    return (
        <>
            <Button
                block={props.block}
                type="primary"
                size={size}
                disabled={isBusy}
                onClick={handleBuyNow}
                className="AddToCartButton__buyNow"
            >
                Buy now
            </Button>
            {preparedPurchase && (
                <>
                    {preparedPurchase.candidateProfileAddresses.length === 0 ? (
                        <Modal
                            open
                            destroyOnHidden
                            title="Choose a default shipping address"
                            onCancel={onCancel}
                            footer={[
                                <Button key="cancel" danger onClick={onCancel}>
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
                    ) : (
                        <BuyNowCreateOrderStep
                            purchase={preparedPurchase}
                            productId={props.productId}
                            quantity={props.quantity}
                            serverURL={props.serverURL}
                            variantId={props.variantId}
                            onCancel={onCancel}
                            onOrderCreated={(submittedOrder) => {
                                setPreparedPurchase(undefined);
                                setSubmittedOrders([submittedOrder]);
                            }}
                        />
                    )}
                </>
            )}
            {submittedOrders.length > 0 && (
                <BuyNowPaymentStep
                    submittedOrders={submittedOrders}
                    onClose={() => {
                        setSubmittedOrders([]);
                    }}
                />
            )}
        </>
    );
};
