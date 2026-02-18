import * as React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useProductByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { formatPrice } from "../../utils";

const ProductServiceDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const product = useProductByIdQuery({ id: id! });
    return (
        <Loader query={product}>
            {(data) => {
                const price = formatPrice(data.Product?.price?.amount, data.Product?.price?.currency);
                return (
                    <div>
                        <Typography.Title level={1}>{data.Product?.name}</Typography.Title>
                        {price && <Typography.Title level={4}>{price}</Typography.Title>}
                        <Markdown>{data.Product?.description}</Markdown>
                    </div>
                );
            }}
        </Loader>
    );
};

export default ProductServiceDetail;
