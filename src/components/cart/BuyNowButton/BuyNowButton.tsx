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

export const BuyNowButton: React.FunctionComponent<BuyNowButtonProps> = ({
    block,
    candidateProfileAddresses,
    disabled,
    productId,
    quantity,
    serverURL,
    size = "large",
    variantId,
}) => {
    const [preparedPurchase, setPreparedPurchase] = React.useState<BuyNowPreparedPurchase>();
    const [submittedOrders, setSubmittedOrders] = React.useState<SubmittedOrder[]>([]);
    const isBusy = disabled || Boolean(preparedPurchase) || submittedOrders.length > 0;

    const handleBuyNow = () => {
        setPreparedPurchase({
            candidateProfileAddresses
        });
    };

    return (
        <>
            <Button
                block={block}
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
                    productId={productId}
                    quantity={quantity}
                    serverURL={serverURL}
                    variantId={variantId}
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
