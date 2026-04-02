import * as React from "react";
import { DollarOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Avatar, Card, Grid, List, Space, Tag, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { ListProductsQuery } from "../../generated/graphql";
import { formatUsdFromCents, getImage } from "../../utils";
import { CartItemCount } from "../cart/CartItemCount";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";
import { RouteButton } from "../RouteButton";
type ProductItem = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];
type ProductServiceCardProps = {
    items: ProductItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};
export const ProductServiceCard: React.FunctionComponent<ProductServiceCardProps> = (props) => {
    const { xl } = Grid.useBreakpoint();
    const remaining = props.totalDocs !== undefined ? props.totalDocs - props.items.length : 0;
    return (
        <Card
            className="SplashEntityCard SplashEntityCard--products"
            title={
                <Typography.Title level={3} className="SplashEntityCard__title">
                    <Link to="/products-services" className="SplashEntityCard__titleLink">
                        Products / Services
                    </Link>
                </Typography.Title>
            }
        >
            <List
                className="SplashEntityCard__list"
                loading={props.loading}
                dataSource={props.items}
                locale={{
                    emptyText: "Coming soon!",
                }}
                renderItem={(product) => {
                    const price = product.priceInUSDEnabled ? formatUsdFromCents(product.priceInUSD) : null;
                    const imageSrc = getImage(product) || getImage(product.company);
                    const detailPath = `/products-services/${product.id}`;
                    const shareTitle = product.name || "Product";
                    const shareText = `Check out ${product.name} on NSwap.`;
                    return (
                        <List.Item actions={xl ? [<SplashShareDetailActionRow key={`product-actions-${product.id}`} detailPath={detailPath} title={shareTitle} text={shareText} />] : undefined}>
                            <div className="SplashEntityCard__itemBody">
                                <List.Item.Meta
                                    avatar={
                                        imageSrc ? (
                                            <Link to={detailPath}>
                                                <Avatar shape="square" size={48} src={imageSrc} className="SplashEntityCard__avatar" />
                                            </Link>
                                        ) : undefined
                                    }
                                    title={
                                        <Link to={detailPath} className="SplashEntityCard__itemLink">
                                            {product.name}
                                        </Link>
                                    }
                                />
                                <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                    {price && (
                                        <Tag color="gold" icon={<DollarOutlined />}>
                                            {`Price: ${price}`}
                                        </Tag>
                                    )}
                                    <CartItemCount productId={product.id} serverURL={product.serverURL!} />
                                </Space>
                                {!xl && <SplashShareDetailActionRow detailPath={detailPath} title={shareTitle} text={shareText} />}
                            </div>
                        </List.Item>
                    );
                }}
            />
            {remaining > 0 && props.identityId && (
                <RouteButton to={`/products-services?tribe=${props.identityId}`} type="link" icon={<RightOutlined />} iconPosition="end" className="SplashEntityCard__moreLink">
                    And +{remaining} more
                </RouteButton>
            )}
        </Card>
    );
};
