import * as React from "react";

import { useParams } from "react-router-dom";

import { Typography } from "antd";

import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { AuthGuard } from "../AuthGuard";
import { useProductByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { OwnerGuard } from "../OwnerGuard";
import { ProductForm } from "../publish/ProductForm";
import { fromCents } from "../shared/product/utils";

const EditProduct: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useProductByIdQuery({ id: id!, draft: true });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const product = data.Product;
                        const companyCreatedById = product?.company?.createdBy?.id;

                        return (
                            <OwnerGuard createdById={companyCreatedById}>
                                <DetailPageTracker serverUrl={product?.serverURL ?? undefined} />
                                <Typography.Title level={3}>Edit Product</Typography.Title>
                                <ProductForm
                                    mode="edit"
                                    initialValues={{
                                        id: product?.id,
                                        name: product?.name,
                                        description: product?.description,
                                        priceInUSD: fromCents(product?.priceInUSD),
                                        url: product?.url,
                                        inventory: product?.inventory,
                                        company: product?.company?.id,
                                        existingImageUrl: product?.image?.url,
                                        existingImageId: product?.image?.id,
                                    }}
                                    url={product?.serverURL!}
                                />
                            </OwnerGuard>
                        );
                    }}
                </Loader>
            </div>
        </AuthGuard>
    );
};

export default EditProduct;
