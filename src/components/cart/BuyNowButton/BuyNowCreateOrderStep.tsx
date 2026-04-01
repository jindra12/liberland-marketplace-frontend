import * as React from "react";
import { useCreateOrderMutation } from "../../hooks";
import type { SubmittedOrder } from "../../order/types";
import { BuyNowAddressModal } from "./BuyNowAddressModal";
import type { AddressWithEmail, BuyNowPreparedPurchase } from "./types";
import useLocalStorage from "use-local-storage";
import { BUY_NOW_SAVED_ADDRESSES_KEY_PREFIX } from "./constants";

type BuyNowCreateOrderStepProps = {
    accountStorageKey: string;
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
    const [shippingAddress, setShippingAddress] = useLocalStorage<AddressWithEmail | undefined>(
        BUY_NOW_SAVED_ADDRESSES_KEY_PREFIX,
        undefined,
    );

    return (
        <BuyNowAddressModal
            open={!shippingAddress || props.purchase.candidateProfileAddresses.length > 1}
            loading={createOrderMutation.isPending}
            options={props.purchase.candidateProfileAddresses}
            selectedKey={selectedAddressKey}
            onCancel={handleCancelAddressSelection}
            onSelect={handleSelectAddress}
        />
    );
};
