import React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useProductByIdQuery } from "../../generated/graphql";
import { AuthGuard } from "../AuthGuard";
import { OwnerGuard } from "../OwnerGuard";
import { Loader } from "../Loader";
import { ProductForm } from "../publish/ProductForm";

const EditProduct: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useProductByIdQuery({ id: id! });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const product = data.Product;
                        const companyCreatedById = (product?.company?.createdBy as { id?: string } | null)?.id;

                        return (
                            <OwnerGuard createdById={companyCreatedById}>
                                <Typography.Title level={3}>Edit Product</Typography.Title>
                                <ProductForm
                                    mode="edit"
                                    initialValues={{
                                        id: product?.id,
                                        name: product?.name || "",
                                        description: product?.description || "",
                                        priceAmount: product?.price?.amount ?? undefined,
                                        priceCurrency: product?.price?.currency || "USD",
                                        url: product?.url || "",
                                        inventory: product?.inventory ?? undefined,
                                        company: product?.company?.id ?? undefined,
                                        existingImageUrl: product?.image?.url ?? undefined,
                                        existingImageId: product?.image?.id ?? undefined,
                                    }}
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
