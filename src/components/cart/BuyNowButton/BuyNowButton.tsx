import * as React from "react";

import { Button } from "antd";

import type { AddressWithEmail, SubmittedOrder } from "../../order/types";

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
                <BuyNowCreateOrderStep
                    purchase={preparedPurchase}
                    productId={props.productId}
                    quantity={props.quantity}
                    serverURL={props.serverURL}
                    variantId={props.variantId}
                    onCancel={() => {
                        setPreparedPurchase(undefined);
                    }}
                    onOrderCreated={(submittedOrder) => {
                        setSubmittedOrders([submittedOrder]);
                    }}
                />
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
