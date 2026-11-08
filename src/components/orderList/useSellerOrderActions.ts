import { message } from "antd";
import { useEndpointContext } from "../EndpointContext";
import { useUpdateSellerOrderProductFulfilledMutation, useUpdateSellerOrderProductRejectedMutation } from "../hooks";
import type { OrderListItemActionsProps } from "./types";

export const useSellerOrderActions = (props: OrderListItemActionsProps) => {
    const { authUrl } = useEndpointContext();
    const fulfillMutation = useUpdateSellerOrderProductFulfilledMutation();
    const rejectMutation = useUpdateSellerOrderProductRejectedMutation();
    const update = async (nextState: "fulfilled" | "rejected") => {
        try {
            const variables = {
                orderId: props.order.orderId,
                paymentProofId: props.order.paymentProofId,
                url: props.order.serverURL || authUrl,
            };
            if (nextState === "fulfilled") {
                await fulfillMutation.mutateAsync({ ...variables, fulfilled: true });
            } else {
                await rejectMutation.mutateAsync({ ...variables, rejected: true });
            }
            await props.onChanged();
            message.success(`Marked ${props.order.product?.name || "order"} as ${nextState}.`);
        } catch (error) {
            console.error(error);
            message.error("Could not update the order state.");
        }
    };
    return { fulfillMutation, rejectMutation, update };
};
