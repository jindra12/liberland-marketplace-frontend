import * as React from "react";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Flex, message } from "antd";

import {
    useUpdateSellerOrderProductFulfilledMutation,
    useUpdateSellerOrderProductRejectedMutation,
} from "../../generated/graphql";

import type { SellerOrderProduct } from "./types";

type OrderListItemActionsProps = {
    order: SellerOrderProduct;
    onChanged: () => Promise<unknown>;
};

export const OrderListItemActions: React.FunctionComponent<OrderListItemActionsProps> = (props) => {
    const fulfillMutation = useUpdateSellerOrderProductFulfilledMutation();
    const rejectMutation = useUpdateSellerOrderProductRejectedMutation();

    const handleStateUpdate = async (nextState: "fulfilled" | "rejected") => {
        try {
            if (nextState === "fulfilled") {
                await fulfillMutation.mutateAsync({
                    fulfilled: true,
                    orderId: props.order.orderId,
                    paymentProofId: props.order.paymentProofId,
                });
            } else {
                await rejectMutation.mutateAsync({
                    orderId: props.order.orderId,
                    paymentProofId: props.order.paymentProofId,
                    rejected: true,
                });
            }

            await props.onChanged();
            message.success(
                nextState === "fulfilled"
                    ? `Marked ${props.order.product?.name || "order"} as fulfilled.`
                    : `Marked ${props.order.product?.name || "order"} as rejected.`,
            );
        } catch (error) {
            console.error(error);
            message.error("Could not update the order state.");
        }
    };

    return (
        <Flex wrap gap={8} className="OrderList__actions">
            <Button
                type={props.order.fulfilled ? "primary" : "default"}
                icon={<CheckOutlined />}
                disabled={props.order.fulfilled}
                loading={fulfillMutation.isPending}
                onClick={() => handleStateUpdate("fulfilled")}
            >
                Mark fulfilled
            </Button>
            <Button
                danger
                type={props.order.rejected ? "primary" : "default"}
                icon={<CloseOutlined />}
                disabled={props.order.rejected}
                loading={rejectMutation.isPending}
                onClick={() => handleStateUpdate("rejected")}
            >
                Mark rejected
            </Button>
        </Flex>
    );
};
