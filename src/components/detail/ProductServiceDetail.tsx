import * as React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useProductByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";

const ProductServiceDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const product = useProductByIdQuery({ id: id! });
    return (
        <Loader query={product}>
            {(product) => (
                <div>
                    <Typography.Title level={1}>{product.Product?.name}</Typography.Title>
                    <Markdown>{product.Product?.description}</Markdown>
                </div>
            )}
        </Loader>
    );
};

export default ProductServiceDetail;
