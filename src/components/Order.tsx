import * as React from "react";
import { Alert, Button, Flex, Form, Result, Spin, Typography, message } from "antd";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import useLocalStorage from "use-local-storage";
import type { ListProductsQuery, Order as OrderType } from "../generated/graphql";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { useCreateOrderMutation, useDeleteCartMutation, useUpdateOrderMutation } from "./hooks";
import { CartSummary, useCartItems } from "./cart/useCartItems";
import { CART_SECRETS_INDEX_KEY, CartSecretEntry } from "./cart/cartSecrets";
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
    const navigate = useNavigate();

    const [page, setPage] = React.useState(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submittedOrders, setSubmittedOrders] = React.useState<SubmittedOrder[]>([]);
    const [showPaymentSuccess, setShowPaymentSuccess] = React.useState(false);
    const [, setCartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);

    const { isLoading, carts, products, refetch, totalQuantity } = useCartItems();
    const createOrderMutation = useCreateOrderMutation();
    const deleteCartMutation = useDeleteCartMutation();
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

    React.useEffect(() => {
        if (!showPaymentSuccess) {
            return;
        }

        const timeout = window.setTimeout(() => {
            navigate("/");
        }, 4000);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [navigate, showPaymentSuccess]);

    const updatePayerAddress = async (entry: SubmittedOrder, walletAddress: string) => {
        if (!entry.order.id) {
            return;
        }

        try {
            await updateOrderMutation.mutateAsync({
                url: entry.url,
                orderId: entry.order.id,
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
    };

    const onSubmit = async (values: OrderFormValues) => {
        if (cartsWithItems.length === 0) {
            message.info("Your cart is empty");
            return;
        }

        setShowPaymentSuccess(false);
        setIsSubmitting(true);

        try {
            const ordered: { cart: CartSummary; order: OrderType }[] = [];
            for (let i = 0; i < cartsWithItems.length; i++) {
                const cart = cartsWithItems[i];
                const items = cart.items
                    .map((item) => ({
                        product: item.product?.id,
                        variant: item.variant?.id,
                        quantity: item.quantity ?? 0,
                    }))
                    .filter((item) => Boolean(item.product) && item.quantity > 0);

                if (items.length === 0) {
                    message.error("Cart has no orderable items");
                    return;
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
                    message.error("Order creation did not return an order id");
                    return;
                }

                await deleteCartMutation.mutateAsync({
                    url: cart.url,
                    id: cart.cartId,
                    trash: false,
                });

                ordered.push({
                    cart,
                    order: createdOrder as OrderType,
                });
            }

            const summary = ordered.reduce((acc, result) => {
                return {
                    ...acc,
                    submittedCarts: acc.submittedCarts + 1,
                    submittedOrders: [...acc.submittedOrders, {
                        url: result.cart.url,
                        order: result.order,
                    }],
                };
            }, {
                submittedCarts: 0,
                submittedOrders: [] as SubmittedOrder[],
            });

            if (summary.submittedOrders.length > 0) {
                const submittedCartKeys = new Set(ordered.map((entry) => `${entry.cart.url}::${entry.cart.secret}`));
                setCartSecrets((prev) => (prev || []).filter((entry) => !submittedCartKeys.has(`${entry.url}::${entry.secret}`)));
            }

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

            message.warning("Order was partially created");
        } catch (error) {
            console.error("Order creation failed", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Unexpected error while creating order";
            message.error(`Could not create order: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showPaymentSuccess) {
        return (
            <Flex vertical gap={16} className="OrderPage">
                <Typography.Title level={2}>Order</Typography.Title>
                <Result
                    status="success"
                    title="All payments completed"
                    subTitle="Thank you for shopping with us. You will be redirected to the homepage shortly."
                    extra={[
                        <Button key="go-home" type="primary" onClick={() => navigate("/")}>
                            Go to homepage
                        </Button>,
                    ]}
                />
            </Flex>
        );
    }

    if (isLoading && submittedOrders.length === 0) {
        return (
            <Flex vertical gap={16} className="OrderPage">
                <Typography.Title level={2}>Order</Typography.Title>
                <Spin />
            </Flex>
        );
    }

    if (totalQuantity <= 0 && submittedOrders.length === 0) {
        return (
            <Flex vertical gap={16} className="OrderPage">
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
        <Flex vertical gap={16} className="OrderPage">
            <Typography.Title level={2}>Order</Typography.Title>
            {submittedOrders.length > 0 ? (
                <OrderPaymentStep
                    submittedOrders={submittedOrders}
                    onPayerAddressSelected={updatePayerAddress}
                    onBackToOrderForm={() => {
                        setShowPaymentSuccess(false);
                        setSubmittedOrders([]);
                    }}
                    onAllPaymentsComplete={() => {
                        setShowPaymentSuccess(true);
                    }}
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
