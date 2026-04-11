import * as React from "react";

import { Link } from "react-router-dom";

import { DollarOutlined, HomeFilled, ShoppingOutlined } from "@ant-design/icons";
import { Flex, Space, Typography } from "antd";

type ProductDetailsSummaryProps = {
    companyName?: string | null;
    companyId?: string | null;
    price?: string | null;
    inventory?: string;
    metaSize?: React.ComponentProps<typeof Space>["size"];
};
export const ProductDetailsSummary: React.FunctionComponent<ProductDetailsSummaryProps> = (props) => {
    const metaSize: React.ComponentProps<typeof Space>["size"] = props.metaSize ?? [12, 8];
    return (
        <Flex vertical gap={4}>
            <Space size={metaSize} wrap>
                {props.companyName && (
                    <Typography.Text strong>
                        <HomeFilled />{" "}
                        {props.companyId ? (
                            <Link to={`/companies/${props.companyId}`}>{props.companyName}</Link>
                        ) : (
                            props.companyName
                        )}
                    </Typography.Text>
                )}
                {props.inventory && (
                    <Typography.Text type="secondary">
                        <ShoppingOutlined /> Inventory: {props.inventory}
                    </Typography.Text>
                )}
            </Space>
            {props.price && (
                <Space size={metaSize} wrap>
                    <Typography.Text strong>
                        <DollarOutlined /> {props.price}
                    </Typography.Text>
                </Space>
            )}
        </Flex>
    );
};
