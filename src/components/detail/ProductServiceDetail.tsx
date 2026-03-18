import * as React from "react";
import { DollarOutlined, EditOutlined, ShoppingOutlined, UsergroupAddOutlined } from "@ant-design/icons";
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
import { formatUsdFromCents, parseActionLink, getImage, isProductPurchasable } from "../../utils";
import { AddToCartButton } from "../cart/AddToCartButton";
import { CartItemCount } from "../cart/CartItemCount";
import { DetailShareSection } from "../share/DetailShareSection";

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
                const price = product?.priceInUSDEnabled ? formatUsdFromCents(product?.priceInUSD) : null;
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
                const canPurchase = isProductPurchasable(product);
                const orderNowLink = parseActionLink(product?.url);
                const orderLink = parseActionLink(product?.url);
                const shareTitle = product?.name ?? "Product";
                const shareText = `Check out ${shareTitle} on NSwap.`;
                const purchaseControl = product?.id ? (
                    canPurchase ? (
                        <AddToCartButton
                            block
                            productId={product.id}
                            serverURL={product.serverURL!}
                            size={md ? "large" : "middle"}
                            maxAvailable={inventoryCount}
                        />
                    ) : orderNowLink ? (
                        <Button
                            block
                            type="primary"
                            href={orderNowLink}
                            size={md ? "large" : "middle"}
                        >
                            Order Now!
                        </Button>
                    ) : null
                ) : null;

                return (
                    <Flex flex={1} vertical gap={12}>
                        <Flex gap="32px" align="center" wrap className="EntityDetail__header">
                            {imageSrc && (
                                <Avatar
                                    shape="circle"
                                    size={md ? 120 : 72}
                                    src={imageSrc}
                                />
                            )}
                            <Flex flex={1} vertical className="EntityDetail__headerBody">
                                <Typography.Title level={1} className="EntityDetail__title">
                                    {product?.name}
                                </Typography.Title>
                                {companyIdentity && (
                                    <div className="ProductDetail__identityRow">
                                        <IdentityTagLink
                                            identity={companyIdentity}
                                            color="success"
                                            icon={<UsergroupAddOutlined />}
                                        />
                                    </div>
                                )}
                                <div className="ProductDetail__summary">
                                    <ProductDetailsSummary
                                        companyName={product?.company?.name}
                                        companyId={product?.company?.id}
                                    />
                                </div>
                                {product?.id && (
                                    <div className="ProductDetail__purchaseSection">
                                        <Flex gap="8px" wrap className="ProductDetail__purchaseMeta">
                                            {price && (
                                                <Tag color="success" icon={<DollarOutlined />}>
                                                    {`Price: ${price}`}
                                                </Tag>
                                            )}
                                            {inventory && (
                                                <Tag icon={<ShoppingOutlined />}>Inventory: {inventory}</Tag>
                                            )}
                                            <CartItemCount
                                                productId={product.id}
                                                serverURL={product.serverURL!}
                                            />
                                        </Flex>
                                        {purchaseControl && (
                                            <>
                                                <Divider className="ProductDetail__purchaseDivider" />
                                                <div className="ProductDetail__purchaseControl">
                                                    {purchaseControl}
                                                </div>
                                            </>
                                        )}
                                    </div>
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
                        <DetailShareSection
                            label="Share this product"
                            title={shareTitle}
                            text={shareText}
                            subscriptionTarget={product ? {
                                collection: "products",
                                targetID: product.id,
                                serverURL: product.serverURL,
                                isSubscribed: product.isSubscribed,
                            } : undefined}
                        />
                        <Divider />
                        <EntityCommentsSection
                            targetId={id!}
                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Products}
                        />
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default ProductServiceDetail;
