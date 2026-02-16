import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { Result, Spin, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import { useProductByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { ProductForm } from "../publish/ProductForm";

const EditProduct: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const auth = useAuth();
    const query = useProductByIdQuery({ id: id! });

    if (auth.isLoading) return <Spin />;
    if (!auth.isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="Publish">
            <Loader query={query}>
                {(data) => {
                    const product = data.Product;
                    const companyCreatedById = (product?.company?.createdBy as { id?: string } | null)?.id;
                    if (companyCreatedById && companyCreatedById !== auth.user?.profile?.sub) {
                        return <Result status="403" title="Not authorized" subTitle="You can only edit your own listings." />;
                    }

                    const initialValues = {
                        id: product?.id,
                        name: product?.name || "",
                        description: product?.description || "",
                        priceAmount: product?.price?.amount ?? undefined,
                        priceCurrency: product?.price?.currency || "USD",
                        url: product?.url || "",
                        inventory: product?.inventory ?? undefined,
                        company: product?.company?.id || undefined,
                        existingImageUrl: product?.image?.url || undefined,
                        existingImageId: product?.image?.id || undefined,
                    };

                    return (
                        <>
                            <Typography.Title level={3}>Edit Product</Typography.Title>
                            <ProductForm mode="edit" initialValues={initialValues} />
                        </>
                    );
                }}
            </Loader>
        </div>
    );
};

export default EditProduct;
