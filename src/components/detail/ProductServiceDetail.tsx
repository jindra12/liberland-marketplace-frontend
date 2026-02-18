import * as React from "react";
import { HomeFilled, ShoppingOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Descriptions, Divider, Flex, Grid, Space, Tag, Typography } from "antd";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useProductByIdQuery,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";

const ProductServiceDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { md } = Grid.useBreakpoint();
    const query = useProductByIdQuery({ id: id! });

    return (
        <Loader query={query}>
            {(data) => {
                const product = data.Product;
                const imageUrl = product?.image?.url || product?.company?.image?.url;
                const amount = product?.price?.amount;
                const price = typeof amount === "number"
                    ? `${product?.price?.currency ?? "USD"} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                    : undefined;
                const properties = (product?.properties ?? []).filter((property) => property?.key || property?.value);
                const inventory = typeof product?.inventory === "number"
                    ? product.inventory.toLocaleString("en-US")
                    : undefined;

                return (
                    <div>
                        <Space size={16} align="start" className="EntityDetail__header">
                            {imageUrl && (
                                <Avatar
                                    shape="circle"
                                    size={md ? 120 : 72}
                                    src={`${BACKEND_URL}${imageUrl}`}
                                />
                            )}
                            <div>
                                <Typography.Title level={1} className="EntityDetail__title">
                                    {product?.name}
                                </Typography.Title>
                                <Space size={[8, 8]} wrap className="EntityDetail__meta">
                                    {product?.company?.id && product.company.name && (
                                        <Link to={`/companies/${product.company.id}`}>
                                            <Tag icon={<HomeFilled />}>{product.company.name}</Tag>
                                        </Link>
                                    )}
                                    {price && <Tag color="processing">{price}</Tag>}
                                    {inventory && (
                                        <Tag icon={<ShoppingOutlined />}>
                                            Inventory: {inventory}
                                        </Tag>
                                    )}
                                </Space>
                            </div>
                        </Space>
                        <Divider />
                        <Markdown>{product?.description}</Markdown>
                        {properties.length > 0 && (
                            <>
                                <Divider />
                                <Typography.Title level={4}>Properties</Typography.Title>
                                <Descriptions bordered column={1} size="small">
                                    {properties.map((property, index) => (
                                        <Descriptions.Item
                                            key={property?.id ?? `${property?.key ?? "property"}-${index}`}
                                            label={property?.key || "Property"}
                                        >
                                            {property?.value}
                                        </Descriptions.Item>
                                    ))}
                                </Descriptions>
                            </>
                        )}
                        {(product?.url || product?.company?.id) && (
                            <>
                                <Divider />
                                <Flex wrap gap="12px">
                                    {product?.url && (
                                        <Button type="primary" href={product.url} target="_blank" rel="noreferrer">
                                            Order now
                                        </Button>
                                    )}
                                    {product?.company?.id && (
                                        <Link to={`/companies/${product.company.id}`}>
                                            <Button>View company</Button>
                                        </Link>
                                    )}
                                </Flex>
                            </>
                        )}
                        <Divider />
                        <EntityCommentsSection
                            targetId={id!}
                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Products}
                            title="Comments"
                        />
                    </div>
                );
            }}
        </Loader>
    );
};

export default ProductServiceDetail;
