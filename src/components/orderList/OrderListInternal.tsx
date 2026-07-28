import * as React from "react";

import { LinkOutlined, WalletOutlined } from "@ant-design/icons";
import { Divider, Flex, Tag, Typography } from "antd";

import { AppList } from "../AppList";

import { OrderListItemActions } from "./OrderListItemActions";
import type { SellerOrderProduct } from "./types";
import {
    buildTransactionExplorerUrl,
    formatShippingContactLine,
    formatShippingAddressLines,
    getOrderStatusColor,
    getOrderStatusLabel,
} from "./utils";

type OrderListInternalProps = {
    items: SellerOrderProduct[];
    hasMore: boolean;
    loading: boolean;
    next: () => void;
    refetch: () => Promise<unknown>;
    emptyText: React.ReactNode;
};

export const OrderListInternal: React.FunctionComponent<OrderListInternalProps> = (props) => {
    return (
        <AppList
            hasMore={props.hasMore}
            items={props.items}
            next={props.next}
            refetch={props.refetch}
            loading={props.loading}
            title="Orders"
            emptyText={props.emptyText}
            renderItem={{
                title: (order) => (
                    <Flex justify="space-between" align="center" gap={12} wrap>
                        <Flex vertical gap={4} className="OrderList__titleWrap">
                            <Typography.Text strong className="OrderList__productName">
                                {order.product?.name || order.productId}
                            </Typography.Text>
                            <Typography.Text type="secondary" className="OrderList__companyName">
                                {order.product?.company?.name || "Unknown company"}
                            </Typography.Text>
                        </Flex>
                        <Tag color={getOrderStatusColor(order)} className="OrderList__statusTag">
                            {getOrderStatusLabel(order)}
                        </Tag>
                    </Flex>
                ),
                description: (order) => (
                    <Flex vertical gap={6} className="OrderList__meta">
                        <Flex wrap gap={8} align="center">
                            <Tag color="blue">Chain: {order.chain}</Tag>
                            {order.orderStatus ? <Tag>{order.orderStatus}</Tag> : null}
                            <Typography.Text type="secondary" className="OrderList__createdAt">
                                Ordered {new Date(order.orderCreatedAt).toLocaleString()}
                            </Typography.Text>
                        </Flex>
                        <Typography.Text className="OrderList__wallet">
                            <WalletOutlined /> Customer wallet:{" "}
                            <Typography.Text code copyable={order.payerAddress ? { text: order.payerAddress } : false}>
                                {order.payerAddress || "Unknown"}
                            </Typography.Text>
                        </Typography.Text>
                        <Typography.Link
                            href={buildTransactionExplorerUrl(order.chain, order.transactionHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="OrderList__transactionLink"
                        >
                            <LinkOutlined /> View transaction on{" "}
                            {order.chain.toLowerCase() === "tron"
                                ? "TronScan"
                                : order.chain.toLowerCase() === "solana"
                                    ? "Solscan"
                                    : "Etherscan"}
                        </Typography.Link>
                    </Flex>
                ),
                body: (order) => {
                    const shippingLines = formatShippingAddressLines(order);
                    const shippingContactLine = formatShippingContactLine(order);

                    return (
                        <Flex vertical gap={12} className="OrderList__body">
                            <Flex vertical gap={4} className="OrderList__shippingAddress">
                                <Typography.Text strong className="OrderList__sectionLabel">
                                    Shipping address
                                </Typography.Text>
                                {shippingLines.length > 0 ? (
                                    <Typography.Text className="OrderList__shippingAddressLine">
                                        {shippingLines.join(" · ")}
                                    </Typography.Text>
                                ) : (
                                    <Typography.Text type="secondary">No shipping address available.</Typography.Text>
                                )}
                                {shippingContactLine.length > 0 ? (
                                    <Flex vertical gap={4} className="OrderList__shippingContact">
                                        <Typography.Text strong className="OrderList__sectionLabel">
                                            Contact
                                        </Typography.Text>
                                        <Typography.Text className="OrderList__shippingContactLine">
                                            {shippingContactLine}
                                        </Typography.Text>
                                    </Flex>
                                ) : null}
                            </Flex>
                            <Divider className="OrderList__divider" />
                            <OrderListItemActions order={order} onChanged={props.refetch} />
                        </Flex>
                    );
                },
            }}
        />
    );
};
