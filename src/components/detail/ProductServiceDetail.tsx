import * as React from "react";
import { UsergroupAddOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Descriptions, Divider, Flex, Grid, Space, Typography } from "antd";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useCompanyByIdQuery,
    useProductByIdQuery,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { IdentityGroups } from "./IdentityGroups";
import { ProductDetailsSummary } from "../shared/ProductDetailsSummary";

const ProductServiceDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { md } = Grid.useBreakpoint();
    const query = useProductByIdQuery({ id: id! });
    const companyId = query.data?.Product?.company?.id;
    const companyQuery = useCompanyByIdQuery(
        { id: companyId || "" },
        { enabled: Boolean(companyId) }
    );

    return (
        <Loader query={query}>
            {(data) => {
                const product = data.Product;
                const imageUrl = product?.image?.url || product?.company?.image?.url;
                const companyData = companyQuery.data?.Company;
                const amount = product?.price?.amount;
                const price = typeof amount === "number"
                    ? `${product?.price?.currency ?? "USD"} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                    : undefined;
                const properties = (product?.properties ?? []).filter((property) => property?.key || property?.value);
                const inventory = typeof product?.inventory === "number"
                    ? product.inventory.toLocaleString("en-US")
                    : undefined;
                const companyIdentity = companyData?.identity?.name ? {
                    id: companyData.identity.id,
                    name: companyData.identity.name,
                } : product?.company?.identity?.name ? {
                    id: product.company.identity.id,
                    name: product.company.identity.name,
                } : undefined;
                const allowedIdentities = companyData?.allowedIdentities || [];
                const disallowedIdentities = companyData?.disallowedIdentities || [];

                return (
                    <Flex flex={1} vertical gap="8px">
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
                                    <Flex justify="space-between" align="center" gap="16px" wrap>
                                        {product?.name}
                                        {companyIdentity && (
                                            <IdentityTagLink
                                                identity={companyIdentity}
                                                color="success"
                                                icon={<UsergroupAddOutlined />}
                                            />
                                        )}
                                    </Flex>
                                </Typography.Title>
                                <ProductDetailsSummary
                                    companyName={product?.company?.name}
                                    companyId={product?.company?.id}
                                    price={price}
                                    inventory={inventory}
                                />
                            </div>
                        </Space>
                        <Divider />
                        <Flex gap="32px" vertical>
                            <Markdown>{product?.description}</Markdown>
                            <IdentityGroups
                                allowedIdentities={allowedIdentities}
                                disallowedIdentities={disallowedIdentities}
                            />
                        </Flex>
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
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default ProductServiceDetail;
