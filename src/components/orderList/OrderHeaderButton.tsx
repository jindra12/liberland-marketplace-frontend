import * as React from "react";

import { Link } from "react-router-dom";

import { OrderedListOutlined } from "@ant-design/icons";
import { Badge, Button } from "antd";

import { routes } from "../../routes";

type OrderHeaderButtonProps = {
    className?: string;
    pendingCount: number;
};

export const OrderHeaderButton: React.FunctionComponent<OrderHeaderButtonProps> = (props) => {
    return (
        <Link to={routes.orders.route} aria-label="Orders" className="AppHeader__ordersLink">
            <Badge count={props.pendingCount} size="small" color="red" overflowCount={999}>
                <Button className={props.className} type="text" icon={<OrderedListOutlined />} />
            </Badge>
        </Link>
    );
};
