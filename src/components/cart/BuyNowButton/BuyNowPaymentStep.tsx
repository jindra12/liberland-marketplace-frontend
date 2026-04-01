import * as React from "react";
import { message } from "antd";
import { useUpdateOrderMutation } from "../../hooks";
import type { SubmittedOrder } from "../../order/types";
import { BuyNowPaymentModal } from "./BuyNowPaymentModal";

type BuyNowPaymentStepProps = {
    onClose: () => void;
    submittedOrders: SubmittedOrder[];
};

export const BuyNowPaymentStep: React.FunctionComponent<BuyNowPaymentStepProps> = ({
    onClose,
    submittedOrders,
}) => {
    const updateOrderMutation = useUpdateOrderMutation();
    const [open, setOpen] = React.useState(false);
    const [paymentComplete, setPaymentComplete] = React.useState(false);

    const updatePayerAddress = React.useCallback(
        async (entry: SubmittedOrder, walletAddress: string) => {
            if (!entry.order.id) {
                return;
            }

            try {
                await updateOrderMutation.mutateAsync({
                    url: entry.url,
                    orderId: entry.order.id,
                    draft: false,
                    data: {
                        payerAddress: walletAddress,
                    },
                });
                message.success(`Saved payer address for order ${entry.order.id}`);
            } catch (error) {
                console.error(error);
                message.error(`Could not save payer address for order ${entry.order.id}`);
            }
        },
        [updateOrderMutation],
    );

    return (
        <BuyNowPaymentModal
            open={open}
            paymentComplete={paymentComplete}
            submittedOrders={submittedOrders}
            onPayerAddressSelected={updatePayerAddress}
            onAllPaymentsComplete={() => {
                setPaymentComplete(true);
            }}
            onCancel={() => {
                setOpen(false);
                onClose();
            }}
        />
    );
};
