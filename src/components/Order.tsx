import * as React from "react";
import { Alert, Flex, Form, Spin, Typography, message } from "antd";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { ListProductsQuery } from "../generated/graphql";
import { useAuth } from "react-oidc-context";
import { useCreateOrderMutation, useUpdateCartMutation, useUpdateOrderMutation } from "./hooks";
import { useCartItems } from "./cart/useCartItems";
import { OrderCreateStep } from "./order/OrderCreateStep";
import { OrderPaymentStep } from "./order/OrderPaymentStep";
import type { OrderFormValues, SubmittedOrder } from "./order/types";
import {
    collectRequiredChainsForCarts,
    inferNameParts,
} from "../utils";

const Order: React.FunctionComponent = () => {
    const [form] = Form.useForm<OrderFormValues>();
    const queryClient = useQueryClient();
    const auth = useAuth();

    const [page, setPage] = React.useState(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submittedOrders, setSubmittedOrders] = React.useState<SubmittedOrder[]>([]);

    const { isLoading, carts, products, refetch, totalQuantity } = useCartItems();
    const createOrderMutation = useCreateOrderMutation();
    const updateCartMutation = useUpdateCartMutation();
    const updateOrderMutation = useUpdateOrderMutation();

    const cartsWithItems = React.useMemo(() => carts.filter((cart) => cart.items.length > 0), [carts]);
    const requiredChains = React.useMemo(() => collectRequiredChainsForCarts(cartsWithItems), [cartsWithItems]);

    const profile = auth.user?.profile;
    const profileEmail = profile?.email;
    const profileGivenName = profile?.given_name;
    const profileFamilyName = profile?.family_name;
    const profileName = profile?.name;
    const inferredNames = inferNameParts(profileName);

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

    const updatePayerAddress = React.useCallback(async (entry: SubmittedOrder, walletAddress: string) => {
        if (!entry.order.id) {
            return;
        }

        try {
            await updateOrderMutation.mutateAsync({
                url: entry.url,
                orderId: entry.order.id,
                secret: entry.secret,
                draft: false,
                data: {
                    payerAddress: walletAddress,
                },
            });
            message.success(`Saved payer address for order ${entry.order.id}`);
        } catch (error) {
            console.error(error);
            message.error(`Could not save payer address for order ${entry.order.id}`);
        }
    }, [updateOrderMutation]);

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

                const createOrderResult = await createOrderMutation.mutateAsync({
                    url: cart.url,
                    draft: false,
                    data: {
                        customerEmail: values.customerEmail,
                        items,
                        shippingAddress: values.shippingAddress,
                    },
                });

                const createdOrder = createOrderResult.createOrder;
                if (!createdOrder?.id) {
                    throw new Error("Order creation did not return an order id");
                }

                await updateCartMutation.mutateAsync({
                    url: cart.url,
                    id: cart.cartId,
                    draft: false,
                    data: {
                        items: [],
                    },
                });

                return {
                    cart,
                    order: createdOrder,
                };
            }));

            const summary = settled.reduce((acc, result, index) => {
                if (result.status === "fulfilled") {
                    return {
                        ...acc,
                        submittedCarts: acc.submittedCarts + 1,
                        submittedOrders: [...acc.submittedOrders, {
                            url: result.value.cart.url,
                            secret: result.value.cart.secret,
                            order: result.value.order,
                        }],
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
                submittedOrders: [] as SubmittedOrder[],
            });

            setSubmittedOrders(summary.submittedOrders);

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

    if (isLoading && submittedOrders.length === 0) {
        return (
            <Flex vertical gap={16}>
                <Typography.Title level={2}>Order</Typography.Title>
                <Spin />
            </Flex>
        );
    }

    if (totalQuantity <= 0 && submittedOrders.length === 0) {
        return (
            <Flex vertical gap={16}>
                <Typography.Title level={2}>Order</Typography.Title>
                <Alert
                    type="info"
                    showIcon
                    message="Your cart is empty"
                    description="Add products before creating an order."
                />
            </Flex>
        );
    }

    return (
        <Flex vertical gap={16}>
            <Typography.Title level={2}>Order</Typography.Title>
            {submittedOrders.length > 0 ? (
                <OrderPaymentStep
                    submittedOrders={submittedOrders}
                    onPayerAddressSelected={updatePayerAddress}
                    onBackToOrderForm={() => setSubmittedOrders([])}
                />
            ) : (
                <OrderCreateStep
                    form={form}
                    query={query}
                    onSubmit={onSubmit}
                    page={page}
                    setPage={setPage}
                    isSubmitting={isSubmitting}
                    cartsWithItemsCount={cartsWithItems.length}
                    profileEmail={profileEmail}
                    prefillFirstName={prefillFirstName}
                    prefillLastName={prefillLastName}
                    requiredChains={requiredChains}
                />
            )}
        </Flex>
    );
};

export default Order;
