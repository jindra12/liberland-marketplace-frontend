import * as React from "react";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Alert, Button, Flex } from "antd";

import type { OrderListItemActionsProps } from "./types";
import { useSellerOrderActions } from "./useSellerOrderActions";

export const OrderListItemActions: React.FunctionComponent<OrderListItemActionsProps> = (props) => {
    const model = useSellerOrderActions(props);

    return (
        <Flex wrap gap={8} className="OrderList__actions">
            <Button
                type={props.order.fulfilled ? "primary" : "default"}
                icon={<CheckOutlined />}
                disabled={props.order.fulfilled || props.order.orderStatus !== "completed"}
                loading={model.fulfillMutation.isPending}
                onClick={() => model.update("fulfilled")}
            >
                Mark fulfilled
            </Button>
            {props.order.orderStatus !== "completed" && (
                <Alert type="warning" showIcon message="Payment is not verified for fulfillment" />
            )}
            <Button
                danger
                type={props.order.rejected ? "primary" : "default"}
                icon={<CloseOutlined />}
                disabled={props.order.rejected}
                loading={model.rejectMutation.isPending}
                onClick={() => model.update("rejected")}
            >
                Mark rejected
            </Button>
        </Flex>
    );
};
