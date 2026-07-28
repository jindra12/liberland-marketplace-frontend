import * as React from "react";

import { useParams } from "react-router-dom";

import { Typography } from "antd";

import { decodeServerUrlSegment } from "../../routes";
import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { AuthGuard } from "../AuthGuard";
import { useProductByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { OwnerGuard } from "../OwnerGuard";
import { ProductForm } from "../publish/ProductForm";
import { fromCents } from "../shared/product/utils";

const EditProduct: React.FunctionComponent = () => {
    const { id, serverUrl } = useParams<{ id: string; serverUrl: string }>();
    const routeServerURL = decodeServerUrlSegment(serverUrl ?? "");
    const query = useProductByIdQuery({ id: id!, draft: true, url: routeServerURL });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const product = data.Product;
                        const companyCreatedById = product?.company?.createdBy?.id;

                        return (
                            <OwnerGuard createdById={companyCreatedById}>
                                <DetailPageTracker serverUrl={product?.serverURL ?? routeServerURL} />
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
                                        parameters: product?.parameters,
                                        cryptoAddresses: product?.cryptoAddresses
                                            ? {
                                                  chain: product.cryptoAddresses.chain,
                                                  address: product.cryptoAddresses.address,
                                              }
                                            : undefined,
                                        existingImageUrl: product?.image?.url,
                                        existingImageId: product?.image?.id,
                                    }}
                                    url={product?.serverURL ?? routeServerURL}
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
