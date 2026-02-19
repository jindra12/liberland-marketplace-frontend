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

export const ProductDetailsSummary: React.FunctionComponent<ProductDetailsSummaryProps> = ({
    companyName,
    companyId,
    price,
    inventory,
    metaSize = [12, 8],
}) => (
    <Flex vertical gap={4}>
        <Space size={metaSize} wrap>
            {companyName && (
                <Typography.Text strong>
                    <HomeFilled />{" "}
                    {companyId ? (
                        <Link to={`/companies/${companyId}`}>{companyName}</Link>
                    ) : (
                        companyName
                    )}
                </Typography.Text>
            )}
            {inventory && (
                <Typography.Text type="secondary">
                    <ShoppingOutlined /> Inventory: {inventory}
                </Typography.Text>
            )}
        </Space>
        {price && (
            <Space size={metaSize} wrap>
                <Typography.Text strong>
                    <DollarOutlined /> {price}
                </Typography.Text>
            </Space>
        )}
    </Flex>
);
