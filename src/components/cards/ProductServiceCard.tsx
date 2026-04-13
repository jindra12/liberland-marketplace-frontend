import * as React from "react";

import { Link } from "react-router-dom";

import { DollarOutlined } from "@ant-design/icons";
import { Avatar, List, Space, Tag } from "antd";

import { ListProductsQuery } from "../../generated/graphql";
import { CartItemCount } from "../cart/CartItemCount";
import { useDislikeProductMutation, useLikeProductMutation } from "../hooks";
import { getImage } from "../shared/image/utils";
import { formatUsdFromCents } from "../shared/product/utils";

import { SplashCard } from "./SplashCard";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type ProductItem = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];
type ProductServiceCardProps = {
    items: ProductItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};
export const ProductServiceCard: React.FunctionComponent<ProductServiceCardProps> = (props) => {
    const likeMutation = useLikeProductMutation();
    const dislikeMutation = useDislikeProductMutation();
    return (
        <SplashCard
            className="SplashEntityCard--products"
            title="Products / Services"
            titleRoute="/products-services"
            items={props.items}
            loading={props.loading}
            totalDocs={props.totalDocs}
            identityId={props.identityId}
            buildMoreLinkRoute={(identityId) => `/products-services?tribe=${identityId}`}
            renderItem={(product) => {
                const price = product.priceInUSDEnabled ? formatUsdFromCents(product.priceInUSD) : null;
                const imageSrc = getImage(product) || getImage(product.company);
                const detailPath = `/products-services/${product.id}`;
                const shareTitle = product.name || "Product";
                const shareText = `Check out ${product.name} on NSwap.`;
                return (
                    <SplashCardItem
                        id={product.id}
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
                        <List.Item.Meta
                            avatar={
                                imageSrc ? (
                                    <Link to={detailPath}>
                                        <Avatar
                                            shape="square"
                                            size={48}
                                            src={imageSrc}
                                            className="SplashEntityCard__avatar"
                                        />
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
                        </SplashCardItem>
                    );
                }}
        />
    );
};
