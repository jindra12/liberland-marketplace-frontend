import * as React from "react";
import { DollarOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, Grid, List, Space, Tag, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { ListProductsQuery } from "../../generated/graphql";
import { formatUsdFromCents, getImage, isProductPurchasable, parseActionLink } from "../../utils";
import { AddToCartButton } from "../cart/AddToCartButton";
import { CartItemCount } from "../cart/CartItemCount";
import { SplashProductActionControls } from "./SplashProductActionControls";

type ProductItem = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];

type ProductServiceCardProps = {
    items: ProductItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
    desktopActionLayout?: "inline" | "stacked";
};

export const ProductServiceCard: React.FunctionComponent<ProductServiceCardProps> = ({
    items,
    loading,
    identityId,
    totalDocs,
    desktopActionLayout = "inline",
}) => {
    const { md } = Grid.useBreakpoint();
    const remaining = totalDocs !== undefined ? totalDocs - items.length : 0;
    return (
        <Card
            className="SplashEntityCard SplashEntityCard--products"
            title={(
                <Typography.Title level={3} className="SplashEntityCard__title">
                    <Link to="/products-services" className="SplashEntityCard__titleLink">Products / Services</Link>
                </Typography.Title>
            )}
        >
            <List
                className="SplashEntityCard__list"
                loading={loading}
                dataSource={items}
                locale={{ emptyText: "Coming soon!" }}
                renderItem={(product) => {
                    const price = product.priceInUSDEnabled ? formatUsdFromCents(product.priceInUSD) : null;
                    const imageSrc = getImage(product) || getImage(product.company);
                    const orderNowLink = parseActionLink(product.url);
                    const canPurchase = isProductPurchasable(product);
                    const detailPath = `/products-services/${product.id}`;
                    const shareTitle = product.name || "Product";
                    const shareText = `Check out ${product.name} on NSwap.`;
                    const purchaseAction = canPurchase ? (
                        <AddToCartButton
                            productId={product.id}
                            serverURL={product.serverURL!}
                            block
                            size="small"
                            maxAvailable={product.inventory}
                        />
                    ) : orderNowLink ? (
                        <Button type="primary" size="small" href={orderNowLink}>
                            Order Now!
                        </Button>
                    ) : undefined;
                    return (
                        <List.Item
                            actions={md ? [(
                                <SplashProductActionControls
                                    key={`product-actions-${product.id}`}
                                    detailPath={detailPath}
                                    title={shareTitle}
                                    text={shareText}
                                    purchaseAction={purchaseAction}
                                    desktopLayout={desktopActionLayout}
                                />
                            )] : undefined}
                        >
                            <div className="SplashEntityCard__itemBody">
                                <List.Item.Meta
                                    avatar={imageSrc ? (
                                        <Link to={detailPath}>
                                            <Avatar
                                                shape="square"
                                                size={48}
                                                src={imageSrc}
                                                className="SplashEntityCard__avatar"
                                            />
                                        </Link>
                                    ) : undefined}
                                    title={(
                                        <Link to={detailPath} className="SplashEntityCard__itemLink">
                                            {product.name}
                                        </Link>
                                    )}
                                />
                                <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                    {price && (
                                        <Tag color="gold" icon={<DollarOutlined />}>
                                            {`Price: ${price}`}
                                        </Tag>
                                    )}
                                    <CartItemCount
                                        productId={product.id}
                                        serverURL={product.serverURL!}
                                    />
                                </Space>
                                {!md && (
                                    <SplashProductActionControls
                                        detailPath={detailPath}
                                        title={shareTitle}
                                        text={shareText}
                                        purchaseAction={purchaseAction}
                                        inline
                                    />
                                )}
                            </div>
                        </List.Item>
                    );
                }}
            />
            {remaining > 0 && identityId && (
                <Link to={`/products-services?tribe=${identityId}`} className="SplashEntityCard__moreLink">
                    <Button type="link" icon={<RightOutlined />} iconPosition="end">
                        And +{remaining} more
                    </Button>
                </Link>
            )}
        </Card>
    );
};
