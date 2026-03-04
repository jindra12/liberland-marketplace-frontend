import * as React from "react";
import {
    Alert,
    Button,
    Card,
    Col,
    Flex,
    Form,
    Input,
    Row,
    Spin,
    Typography,
    message,
} from "antd";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import type { ListProductsQuery, MutationOrder_ShippingAddressInput } from "../generated/graphql";
import { useCreateOrderMutation, useUpdateCartMutation } from "./hooks";
import { useCartItems } from "./cart/useCartItems";
import { ProductServiceListInternal } from "./lists/ProductServiceListInternal";
import { GeoapifyAddressFormItem } from "./order/GeoapifyAddressFormItem";

type OrderFormValues = {
    customerEmail: string;
    shippingAddress: MutationOrder_ShippingAddressInput;
};

const readText = (value: unknown) => {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const inferNames = (fullName?: string) => {
    if (!fullName) {
        return {
            firstName: undefined,
            lastName: undefined,
        };
    }

    const [firstName, ...rest] = fullName.split(/\s+/);
    return {
        firstName,
        lastName: rest.join(" ") || undefined,
    };
};

const Order: React.FunctionComponent = () => {
    const [form] = Form.useForm<OrderFormValues>();
    const queryClient = useQueryClient();
    const auth = useAuth();

    const [page, setPage] = React.useState(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { isLoading, carts, products, refetch, totalQuantity } = useCartItems();
    const createOrderMutation = useCreateOrderMutation();
    const updateCartMutation = useUpdateCartMutation();

    const cartsWithItems = React.useMemo(() => carts.filter((cart) => cart.items.length > 0), [carts]);

    const profile = auth.user?.profile as Record<string, unknown> | undefined;
    const profileEmail = readText(profile?.email);
    const profileGivenName = readText(profile?.given_name);
    const profileFamilyName = readText(profile?.family_name);
    const inferredNames = inferNames(readText(profile?.name));

    const prefillFirstName = profileGivenName || inferredNames.firstName;
    const prefillLastName = profileFamilyName || inferredNames.lastName;

    const query = React.useMemo(() => ({
        data: {
            Products: {
                docs: products,
                hasNextPage: false,
            },
        },
        isLoading,
        refetch: async () => {
            await refetch();
            return undefined as unknown as any;
        },
    }) as UseQueryResult<ListProductsQuery, unknown>, [isLoading, products, refetch]);

    const onSubmit = async (values: OrderFormValues) => {
        if (cartsWithItems.length === 0) {
            message.info("Your cart is empty");
            return;
        }

        setIsSubmitting(true);

        try {
            const settled = await Promise.allSettled(cartsWithItems.map(async (cart) => {
                const items = cart.items
                    .map((item) => ({
                        product: item.product?.id,
                        variant: item.variant?.id,
                        quantity: item.quantity ?? 0,
                    }))
                    .filter((item) => Boolean(item.product) && item.quantity > 0);

                if (items.length === 0) {
                    throw new Error("Cart has no orderable items");
                }

                await createOrderMutation.mutateAsync({
                    url: cart.url,
                    draft: false,
                    data: {
                        customerEmail: values.customerEmail,
                        items,
                        shippingAddress: values.shippingAddress,
                    },
                });

                await updateCartMutation.mutateAsync({
                    url: cart.url,
                    id: cart.cartId,
                    draft: false,
                    data: {
                        items: [],
                    },
                });
            }));

            const summary = settled.reduce((acc, result, index) => {
                if (result.status === "fulfilled") {
                    return {
                        ...acc,
                        submittedCarts: acc.submittedCarts + 1,
                    };
                }

                const failedNames = cartsWithItems[index]?.items
                    .map((item) => item.product?.name)
                    .filter((name): name is string => Boolean(name)) || [];

                return {
                    ...acc,
                    failedProductNames: [...acc.failedProductNames, ...failedNames],
                };
            }, {
                submittedCarts: 0,
                failedProductNames: [] as string[],
            });

            if (summary.submittedCarts > 0) {
                await queryClient.invalidateQueries({ queryKey: ["CartBySecret"] });
                await refetch();
            }

            if (summary.submittedCarts === cartsWithItems.length) {
                message.success("All products submitted");
                return;
            }

            if (summary.submittedCarts === 0) {
                message.error("No products submitted");
                return;
            }

            const uniqueFailedProductNames = Array.from(new Set(summary.failedProductNames));
            const failedProducts = uniqueFailedProductNames.length > 0
                ? uniqueFailedProductNames.join(", ")
                : "some products";

            message.warning(`Here's what you could not buy: ${failedProducts}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Flex vertical gap={16}>
                <Typography.Title level={2}>Order</Typography.Title>
                <Spin />
            </Flex>
        );
    }

    if (totalQuantity <= 0) {
        return (
            <Flex vertical gap={16}>
                <Typography.Title level={2}>Order</Typography.Title>
                <Alert
                    type="info"
                    showIcon
                    message="Your cart is empty"
                    description="Add products before creating an order."
                    action={(
                        <Link to="/cart">
                            <Button type="primary">Go to cart</Button>
                        </Link>
                    )}
                />
            </Flex>
        );
    }

    return (
        <Flex vertical gap={16}>
            <Typography.Title level={2}>Order</Typography.Title>
            <Typography.Paragraph type="secondary">
                One click will submit one order per server/cart using the same shipping and contact details.
            </Typography.Paragraph>

            <Form
                id="order-form"
                layout="vertical"
                form={form}
                onFinish={onSubmit}
                initialValues={{
                    customerEmail: profileEmail,
                    shippingAddress: {
                        country: "United States",
                        firstName: prefillFirstName,
                        lastName: prefillLastName,
                    },
                }}
            >
                <Card title="Shipping">
                    <Form.Item
                        name="customerEmail"
                        label="Email"
                        rules={[
                            { required: true, message: "Required" },
                            { type: "email", message: "Invalid email" },
                        ]}
                    >
                        <Input type="email" placeholder="you@example.com" />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={["shippingAddress", "firstName"]}
                                label="First name"
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={["shippingAddress", "lastName"]}
                                label="Last name"
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <GeoapifyAddressFormItem name={["shippingAddress"]} label="Address" />

                    <Row gutter={12}>
                        <Col xs={24} md={12}>
                            <Form.Item name={["shippingAddress", "company"]} label="Company (optional)">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name={["shippingAddress", "phone"]} label="Phone (optional)">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Form>

            <ProductServiceListInternal
                page={page}
                setPage={setPage}
                query={query}
                title="Order summary"
            />

            <Flex justify="space-between" wrap gap={12}>
                <Link to="/cart">
                    <Button>Back to cart</Button>
                </Link>
                <Button
                    type="primary"
                    htmlType="submit"
                    form="order-form"
                    loading={isSubmitting}
                    disabled={cartsWithItems.length === 0}
                >
                    Create order
                </Button>
            </Flex>
        </Flex>
    );
};

export default Order;
