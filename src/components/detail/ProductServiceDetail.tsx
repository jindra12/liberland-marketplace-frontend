import * as React from "react";
import { useParams } from "react-router-dom";
import { useProductByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";

const ProductServiceDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const product = useProductByIdQuery({ id: id! });
    return (
        <Loader query={product}>
            {(product) => (
                
            )}
        </Loader>
    );
};

export default ProductServiceDetail;
