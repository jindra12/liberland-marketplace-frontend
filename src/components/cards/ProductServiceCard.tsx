import * as React from "react";

import { Link } from "react-router-dom";

import { DollarOutlined } from "@ant-design/icons";
import { Avatar, Space, Tag } from "antd";

import { ListProductsQuery } from "../../generated/graphql";
import { CartItemCount } from "../cart/CartItemCount";
import { useDislikeProductMutation, useLikeProductMutation } from "../hooks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";
import { formatUsdFromCents } from "../shared/product/utils";

import { SplashCard } from "./SplashCard";
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
        <SplashCard
            className="SplashEntityCard--products"
            items={props.items}
            loading={props.loading}
            renderItem={(product) => {
                const price = product.priceInUSDEnabled ? formatUsdFromCents(product.priceInUSD) : null;
                const imageSrc = getImage(product) || getImage(product.company);
                const detailPath = `/products-services/${product.id}`;
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
                        {product.company?.identity && (
                            <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                <IdentityTagLink identity={product.company.identity} color="success" />
                            </Space>
                        )}
                        <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                            {price && (
                                <Tag color="gold" icon={<DollarOutlined />}>
                                    {`Price: ${price}`}
                                </Tag>
                            )}
                            <CartItemCount productId={product.id} serverURL={product.serverURL!} />
                        </Space>
                    </SplashCardItem>
                );
            }}
        />
    );
};
