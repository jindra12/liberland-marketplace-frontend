import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, List, Space, Tag, Typography } from "antd";
import { ListProductsQuery } from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";
import { formatPrice } from "../../utils";

type ProductItem = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];

type ProductServiceCardProps = {
    items: ProductItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};

export const ProductServiceCard: React.FunctionComponent<ProductServiceCardProps> = ({
    items,
    loading,
    totalDocs,
    identityId,
}) => {
    const remaining = totalDocs != null ? totalDocs - items.length : 0;
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
            locale={{ emptyText: "No products/services for this tribe" }}
            renderItem={(product) => {
                const price = formatPrice(product.price?.amount, product.price?.currency);
                const imageUrl = product.image?.url || product.company?.image?.url;
                return (
                    <List.Item
                        actions={[
                            (
                                <Link key={`product-link-${product.id}`} to={`/products-services/${product.id}`}>
                                    <Button>Details</Button>
                                </Link>
                            ),
                        ]}
                    >
                        <div className="SplashEntityCard__itemBody">
                            <List.Item.Meta
                                avatar={imageUrl ? (
                                    <Link to={`/products-services/${product.id}`}>
                                        <Avatar
                                            shape="square"
                                            size={48}
                                            src={`${BACKEND_URL}${imageUrl}`}
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
                            </Space>
                        </div>
                    </List.Item>
                );
            }}
        />
        {remaining > 0 && identityId && (
            <Link to={`/products-services?tribe=${identityId}`} className="SplashEntityCard__moreLink">
                And +{remaining} more
            </Link>
        )}
    </Card>
    );
};
