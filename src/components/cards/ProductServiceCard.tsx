import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, List, Space, Tag, Typography } from "antd";
import { ListProductsQuery } from "../../generated/graphql";
import { formatPriceFromCents, getImage, isProductPurchasable, parseActionLink } from "../../utils";
import { AddToCartButton } from "../cart/AddToCartButton";
import { CartItemCount } from "../cart/CartItemCount";

type ProductItem = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];

type ProductServiceCardProps = {
    items: ProductItem[];
    loading?: boolean;
};

export const ProductServiceCard: React.FunctionComponent<ProductServiceCardProps> = ({
    items,
    loading,
}) => (
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
            locale={{ emptyText: "No products/services for this tribe" }}
            renderItem={(product) => {
                const price = product.priceInUSDEnabled ? formatPriceFromCents(product.priceInUSD, "USD") : null;
                const imageSrc = getImage(product) || getImage(product.company);
                const orderNowLink = parseActionLink(product.url);
                const canPurchase = isProductPurchasable(product);
                const purchaseAction = canPurchase ? (
                    <AddToCartButton
                        key={`product-cart-${product.id}`}
                        productId={product.id}
                        serverURL={product.serverURL!}
                        size="small"
                        maxAvailable={product.inventory}
                    />
                ) : orderNowLink ? (
                    <Button key={`product-order-${product.id}`} type="primary" size="small" href={orderNowLink}>
                        Order Now!
                    </Button>
                ) : undefined;
                return (
                    <List.Item
                        actions={purchaseAction ? [purchaseAction] : []}
                    >
                        <div className="SplashEntityCard__itemBody">
                            <List.Item.Meta
                                avatar={imageSrc ? (
                                    <Link to={`/products-services/${product.id}`}>
                                        <Avatar
                                            shape="square"
                                            size={48}
                                            src={imageSrc}
                                            className="SplashEntityCard__avatar"
                                        />
                                    </Link>
                                ) : undefined}
                                title={(
                                    <Link to={`/products-services/${product.id}`} className="SplashEntityCard__itemLink">
                                        {product.name}
                                    </Link>
                                )}
                            />
                            <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                {product.company?.name && (
                                    <Typography.Text type="secondary">{product.company.name}</Typography.Text>
                                )}
                                {price && <Tag color="gold">{price}</Tag>}
                                <CartItemCount
                                    productId={product.id}
                                    serverURL={product.serverURL!}
                                    hideWhenZero
                                />
                            </Space>
                        </div>
                    </List.Item>
                );
            }}
        />
    </Card>
);
