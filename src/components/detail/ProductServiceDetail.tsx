import * as React from "react";
import { EditOutlined, ShoppingOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { Avatar,
    Button,
    Descriptions,
    Divider,
    Flex,
    Grid,
    Tag,
    Typography
 } from "antd";
import { useAuth } from "react-oidc-context";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { IdentityGroups } from "./IdentityGroups";
import { ProductDetailsSummary } from "../shared/ProductDetailsSummary";
import { useCompanyByIdQuery, useProductByIdQuery } from "../hooks";
import { formatPrice, parseActionLink, getImage } from "../../utils";
import { AddToCartButton } from "../cart/AddToCartButton";
import { CartItemCount } from "../cart/CartItemCount";

const ProductServiceDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { md } = Grid.useBreakpoint();
    const auth = useAuth();
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
                const imageSrc = getImage(product) || getImage(product?.company);
                const companyData = companyQuery.data?.Company;
                const properties = (product?.properties ?? []).filter((property) => property?.key || property?.value);
                const inventoryCount = typeof product?.inventory === "number"
                    ? product.inventory
                    : undefined;
                const inventory = typeof inventoryCount === "number"
                    ? inventoryCount.toLocaleString("en-US")
                    : undefined;
                const price = formatPrice(product?.price?.amount, product?.price?.currency);
                const companyIdentity = companyData?.identity?.name ? {
                    id: companyData.identity.id,
                    name: companyData.identity.name,
                } : product?.company?.identity?.name ? {
                    id: product.company.identity.id,
                    name: product.company.identity.name,
                } : undefined;
                const allowedIdentities = companyData?.allowedIdentities || [];
                const disallowedIdentities = companyData?.disallowedIdentities || [];
                const isOwner = auth.user?.profile?.sub && product?.company?.createdBy?.id === auth.user.profile.sub;
                const orderLink = parseActionLink(product?.url);

                return (
                    <Flex flex={1} vertical gap="8px">
                        <Flex gap="32px" align="center" wrap className="EntityDetail__header">
                            {imageSrc && (
                                <Avatar
                                    shape="circle"
                                    size={md ? 120 : 72}
                                    src={imageSrc}
                                />
                            )}
                            <Flex flex={1} vertical>
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
                                />
                                {product?.id && (
                                    <Flex justify="space-between" align="center" wrap gap="16px" className="ProductDetail__purchaseRow">
                                        <Flex gap="8px" wrap className="ProductDetail__purchaseMeta">
                                            {price && <Tag color="success">{price}</Tag>}
                                            {inventory && (
                                                <Tag icon={<ShoppingOutlined />}>Inventory: {inventory}</Tag>
                                            )}
                                            <CartItemCount
                                                productId={product.id}
                                                serverURL={product.serverURL!}
                                            />
                                        </Flex>
                                        <AddToCartButton
                                            productId={product.id}
                                            serverURL={product.serverURL!}
                                            size={md ? "large" : "middle"}
                                            maxAvailable={inventoryCount}
                                        />
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>
                        {isOwner && (
                            <Link to={`/products-services/edit/${id}`}>
                                <Button icon={<EditOutlined />}>Edit</Button>
                            </Link>
                        )}
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
                        {(orderLink || product?.company?.id) && (
                            <>
                                <Divider />
                                <Flex wrap gap="12px">
                                    {orderLink && (
                                        <Button
                                            type="primary"
                                            href={orderLink}
                                        >
                                            Visit Website
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
