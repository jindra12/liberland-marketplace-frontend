/* eslint-disable import/no-default-export */
import * as React from "react";

import { OrderListInternal } from "./orderList/OrderListInternal";
import { useOrderListModel } from "./orderList/useOrderListModel";

const OrderList: React.FunctionComponent = () => {
    const model = useOrderListModel();

    return (
        <div className="OrderListPage">
            <OrderListInternal {...model} />
        </div>
    );
};

export default OrderList;
