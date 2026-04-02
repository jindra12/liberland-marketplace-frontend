import * as React from "react";
import { message } from "antd";
import { useAuth } from "react-oidc-context";
import { useEndpointContext } from "../../EndpointContext";
import { useMeUserQuery, useUpdateOrderMutation } from "../../hooks";
import type { SubmittedOrder } from "../../order/types";
import { buildPaymentProfileUsersByUrl } from "../../order/payment/utils";
import { BuyNowPaymentModal } from "./BuyNowPaymentModal";
type BuyNowPaymentStepProps = {
    onClose: () => void;
    submittedOrders: SubmittedOrder[];
};
export const BuyNowPaymentStep: React.FunctionComponent<BuyNowPaymentStepProps> = (props) => {
    const auth = useAuth();
    const { enabled } = useEndpointContext();
    const meUsersQuery = useMeUserQuery(undefined, {
        enabled: Boolean(auth.user),
    });
    const updateOrderMutation = useUpdateOrderMutation();
    const [open, setOpen] = React.useState(false);
    const [paymentComplete, setPaymentComplete] = React.useState(false);
    const profileUsersByUrl = React.useMemo(() => buildPaymentProfileUsersByUrl(meUsersQuery.data, enabled), [enabled, meUsersQuery.data]);
    const updatePayerAddress = async (entry: SubmittedOrder, walletAddress: string) => {
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
    };
    return (
        <BuyNowPaymentModal
            onPaymentWalletRemembered={async () => {
                await meUsersQuery.refetch();
            }}
            open={open}
            paymentComplete={paymentComplete}
            profileUsersByUrl={profileUsersByUrl}
            submittedOrders={props.submittedOrders}
            onPayerAddressSelected={updatePayerAddress}
            onAllPaymentsComplete={() => {
                setPaymentComplete(true);
            }}
            onCancel={() => {
                setOpen(false);
                props.onClose();
            }}
        />
    );
};
