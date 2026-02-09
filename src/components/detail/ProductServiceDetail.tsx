import * as React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useProductByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";

const ProductServiceDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const product = useProductByIdQuery({ id: id! });
    return (
        <Loader query={product}>
            {(product) => (
                <Typography.Title level={1}>{product.Product?.name}</Typography.Title>
            )}
        </Loader>
    );
};

export default ProductServiceDetail;
