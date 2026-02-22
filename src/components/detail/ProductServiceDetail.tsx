import * as React from "react";
import { EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Descriptions, Divider, Flex, Grid, Typography } from "antd";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useCompanyByIdQuery,
    useProductByIdQuery,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { IdentityGroups } from "./IdentityGroups";
import { ProductDetailsSummary } from "../shared/ProductDetailsSummary";
import { formatPrice } from "../../utils";

const ProductServiceDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { md } = Grid.useBreakpoint();
    const auth = useAuth();
    const query = useProductByIdQuery({ id: id! });
    const companyId = query.data?.Product?.company?.id;
    const companyQuery = useCompanyByIdQuery(
        { id: companyId || "" },
        { enabled: Boolean(companyId) }
    );

    return (
        <Loader query={query}>
            {(data) => {
                const product = data.Product;
                const imageUrl = product?.image?.url || product?.company?.image?.url;
                const companyData = companyQuery.data?.Company;
                const properties = (product?.properties ?? []).filter((property) => property?.key || property?.value);
                const inventory = typeof product?.inventory === "number"
                    ? product.inventory.toLocaleString("en-US")
                    : undefined;
                const companyIdentity = companyData?.identity?.name ? {
                    id: companyData.identity.id,
                    name: companyData.identity.name,
                } : product?.company?.identity?.name ? {
                    id: product.company.identity.id,
                    name: product.company.identity.name,
                } : undefined;
                const allowedIdentities = companyData?.allowedIdentities || [];
                const disallowedIdentities = companyData?.disallowedIdentities || [];
                const isOwner = auth.user?.profile?.sub && product?.company?.createdBy?.id === auth.user.profile.sub;

                return (
                    <Flex flex={1} vertical gap="8px">
                        <Flex gap="32px" align="center" wrap className="EntityDetail__header">
                            {imageUrl && (
                                <Avatar
                                    shape="circle"
                                    size={md ? 120 : 72}
                                    src={`${BACKEND_URL}${imageUrl}`}
                                />
                            )}
                            <Flex flex={1} vertical>
                                <Typography.Title level={1} className="EntityDetail__title">
                                    <Flex justify="space-between" align="center" gap="16px" wrap>
                                        {product?.name}
                                        {companyIdentity && (
                                            <IdentityTagLink
                                                identity={companyIdentity}
                                                color="success"
                                                icon={<UsergroupAddOutlined />}
                                            />
                                        )}
                                    </Flex>
                                </Typography.Title>
                                <ProductDetailsSummary
                                    companyName={product?.company?.name}
                                    companyId={product?.company?.id}
                                    price={formatPrice(product?.price?.amount, product?.price?.currency)}
                                    inventory={inventory}
                                />
                            </Flex>
                        </Flex>
                        {isOwner && (
                            <Link to={`/products-services/edit/${id}`}>
                                <Button icon={<EditOutlined />}>Edit</Button>
                            </Link>
                        )}
                        <Divider />
                        <Flex gap="32px" vertical>
                            <Markdown>{product?.description}</Markdown>
                            <IdentityGroups
                                allowedIdentities={allowedIdentities}
                                disallowedIdentities={disallowedIdentities}
                            />
                        </Flex>
                        {properties.length > 0 && (
                            <>
                                <Divider />
                                <Typography.Title level={4}>Properties</Typography.Title>
                                <Descriptions bordered column={1} size="small">
                                    {properties.map((property, index) => (
                                        <Descriptions.Item
                                            key={property?.id ?? `${property?.key ?? "property"}-${index}`}
                                            label={property?.key || "Property"}
                                        >
                                            {property?.value}
                                        </Descriptions.Item>
                                    ))}
                                </Descriptions>
                            </>
                        )}
                        {(product?.url || product?.company?.id) && (
                            <>
                                <Divider />
                                <Flex wrap gap="12px">
                                    {product?.url && (
                                        <Button type="primary" href={product.url} target="_blank" rel="noreferrer">
                                            Order now
                                        </Button>
                                    )}
                                    {product?.company?.id && (
                                        <Link to={`/companies/${product.company.id}`}>
                                            <Button>View company</Button>
                                        </Link>
                                    )}
                                </Flex>
                            </>
                        )}
                        <Divider />
                        <EntityCommentsSection
                            targetId={id!}
                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Products}
                            title="Comments"
                        />
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default ProductServiceDetail;
