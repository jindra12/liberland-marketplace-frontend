import * as React from "react";

import { Link } from "react-router-dom";

import { DollarOutlined } from "@ant-design/icons";
import { Avatar, Space, Tag } from "antd";

import { ListProductsQuery, Product } from "../../generated/graphql";
import { routes } from "../../routes";
import { CartItemCount } from "../cart/CartItemCount";
import { useDislikeProductMutation, useLikeProductMutation } from "../hooks";
import { EntityDescription } from "../shared/EntityDescription";
import { getImage } from "../shared/image/utils";
import { formatUsdFromCents } from "../shared/product/utils";

import { ProductCarousel } from "./ProductCarousel";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type ProductItem = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];
type ProductServiceCardProps = {
    items: ProductItem[];
    loading?: boolean;
};

export const ProductServiceCard: React.FunctionComponent<ProductServiceCardProps> = (props) => {
    const likeMutation = useLikeProductMutation();
    const dislikeMutation = useDislikeProductMutation();

    return (
        <ProductCarousel
            className="SplashEntityCard--products"
            items={props.items}
            loading={props.loading}
            renderItem={(product) => {
                const price = product.priceInUSDEnabled ? formatUsdFromCents(product.priceInUSD) : null;
                const imageSrc = getImage(product) || getImage(product.company);
                const detailPath = routes.productsServices.detail.getLink(product as Product);
                const shareTitle = product.name || "Product";
                const shareText = `Check out ${product.name} on NSwap.`;

                return (
                    <SplashCardItem
                        id={product.id}
                        detailPath={detailPath}
                        title={product.name || "Product"}
                        avatar={
                            imageSrc ? (
                                <Link to={detailPath}>
                                    <Avatar
                                        shape="square"
                                        size={80}
                                        src={imageSrc}
                                        className="SplashEntityCard__avatar"
                                    />
                                </Link>
                            ) : null
                        }
                        liked={product.hasLiked}
                        likeCount={product.likeCount}
                        serverURL={product.serverURL}
                        likeActions={{
                            likeMutation,
                            dislikeMutation,
                        }}
                        actions={[
                            <SplashShareDetailActionRow
                                key={`product-actions-${product.id}`}
                                detailPath={detailPath}
                                title={shareTitle}
                                text={shareText}
                            />,
                        ]}
                    >
                        <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                            {price && (
                                <Tag color="gold" icon={<DollarOutlined />}>
                                    {`Price: ${price}`}
                                </Tag>
                            )}
                            <CartItemCount productId={product.id} serverURL={product.serverURL!} />
                        </Space>
                        <EntityDescription
                            description={product.description}
                            identity={product.company?.identity}
                            serverURL={product.serverURL}
                        />
                    </SplashCardItem>
                );
            }}
        />
    );
};
