import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";

import { Alert, Flex, Result, Spin, Typography, message } from "antd";
import useLocalStorage from "use-local-storage";
import { useSessionStorage, useTimeout } from "usehooks-ts";

import { routes } from "../routes";

import { CART_SECRETS_INDEX_KEY, CartSecretEntry } from "./cart/cartSecrets";
import { CartSummary, useCartItems } from "./cart/useCartItems";
import { useEndpointContext } from "./EndpointContext";
import { useCreateOrderMutation, useDeleteCartMutation, useMeUserQuery, useUpdateOrderMutation } from "./hooks";
import { CHECKOUT_ORDERS_STORAGE_KEY, SAVED_SHIPPING_ADDRESS_STORAGE_KEY } from "./order/constants";
import { McpCheckoutHydrator } from "./order/McpCheckoutHydrator";
import { OrderCreateStep } from "./order/OrderCreateStep";
import { OrderPaymentStep } from "./order/OrderPaymentStep";
import { collectRequiredChainsForCarts, buildPaymentProfileUsersByUrl } from "./order/payment/utils";
import type { AddressWithEmail, CheckoutOrder, OrderFormValues, SubmittedOrder } from "./order/types";
import { buildOrderPrefill, buildProfileShippingAddresses } from "./order/utils";
import { buildProductParameterSelectionMap, buildSelectedProductParametersInput } from "./productParameters/utils";
import { RouteButton } from "./RouteButton";

const OrderContent: React.FunctionComponent = () => {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const navigate = useNavigate();
    const { enabled } = useEndpointContext();

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submittedOrders, setSubmittedOrders] = useSessionStorage<CheckoutOrder[]>(
        `${CHECKOUT_ORDERS_STORAGE_KEY}:${auth.user?.profile.iss || "guest"}:${auth.user?.profile.sub || "guest"}`,
        [],
    );
    const [showPaymentSuccess, setShowPaymentSuccess] = React.useState(false);
    const [, setCartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const [savedShippingAddress, setSavedShippingAddress] = useLocalStorage<AddressWithEmail | undefined>(
        SAVED_SHIPPING_ADDRESS_STORAGE_KEY,
        undefined,
    );

    const { isLoading, carts, products, refetch, totalQuantity } = useCartItems();
    const meUsersQuery = useMeUserQuery(undefined, { enabled: Boolean(auth.user) });
    const createOrderMutation = useCreateOrderMutation();
    const deleteCartMutation = useDeleteCartMutation();
    const updateOrderMutation = useUpdateOrderMutation();

    const cartsWithItems = React.useMemo(() => carts.filter((cart) => cart.items.length > 0), [carts]);
    const requiredChains = React.useMemo(() => collectRequiredChainsForCarts(cartsWithItems), [cartsWithItems]);
    const candidateProfileAddresses = React.useMemo(
        () => buildProfileShippingAddresses(meUsersQuery.data),
        [meUsersQuery.data],
    );
    const profileUsersByUrl = React.useMemo(
        () => buildPaymentProfileUsersByUrl(meUsersQuery.data, enabled),
        [enabled, meUsersQuery.data],
    );
    const { profileEmail, prefillFirstName, prefillLastName } = React.useMemo(
        () => buildOrderPrefill(meUsersQuery.data),
        [meUsersQuery.data],
    );
    const buildSelectedParametersForOrderItem = (item: CartSummary["items"][number]) => {
        const selectedValues = buildProductParameterSelectionMap(item.parameters);
        return buildSelectedProductParametersInput(item.product?.parameters, selectedValues);
    };

    useTimeout(
        () => {
            navigate(routes.home.route);
        },
        showPaymentSuccess ? 4000 : null,
    );

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
        setShowPaymentSuccess(false);
        setIsSubmitting(true);

        try {
            await cartsWithItems.reduce(async (previous, cart) => {
                await previous;
                const recovered = submittedOrders.find(
                    (entry) => entry.url === cart.url && entry.cartId === cart.cartId,
                );
                if (!recovered) {
                    const items = cart.items
                        .map((item) => ({
                            product: item.product?.id,
                            variant: item.variant?.id,
                            quantity: item.quantity ?? 0,
                            parameters: buildSelectedParametersForOrderItem(item),
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

                    // Persist before any cleanup or the next backend can fail.
                    setSubmittedOrders((current) => [
                        ...current,
                        { url: cart.url, cartId: cart.cartId, order: createdOrder },
                    ]);
                }

                await deleteCartMutation.mutateAsync({
                    url: cart.url,
                    id: cart.cartId,
                    trash: false,
                });

                setCartSecrets((current) =>
                    (current || []).filter((entry) => entry.url !== cart.url || entry.secret !== cart.secret),
                );
            }, Promise.resolve());
            await queryClient.invalidateQueries({ queryKey: ["CartBySecret"] });
            message.success("All products submitted");
        } catch (error) {
            console.error("Order creation failed", error);
            const errorMessage =
                error instanceof Error && error.message ? error.message : "Unexpected error while creating order";
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
                        <RouteButton key="go-home" to={routes.home.route} type="primary">
                            Go to homepage
                        </RouteButton>,
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
                    onPaymentWalletRemembered={async () => {
                        await meUsersQuery.refetch();
                    }}
                    submittedOrders={submittedOrders}
                    onPayerAddressSelected={updatePayerAddress}
                    onAllPaymentsComplete={() => {
                        setSubmittedOrders([]);
                        setShowPaymentSuccess(true);
                    }}
                    profileUsersByUrl={profileUsersByUrl}
                />
            ) : null}
            {cartsWithItems.length > 0 && (
                <OrderCreateStep
                    products={products}
                    isProductsLoading={isLoading}
                    refetchProducts={refetch}
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                    cartsWithItemsCount={cartsWithItems.length}
                    candidateProfileAddresses={candidateProfileAddresses}
                    isLoadingProfileAddresses={meUsersQuery.isLoading}
                    savedShippingAddress={savedShippingAddress}
                    onSelectSavedShippingAddress={(id) => {
                        setSavedShippingAddress(candidateProfileAddresses.find((address) => address.id === id));
                    }}
                    profileEmail={profileEmail}
                    prefillFirstName={prefillFirstName}
                    prefillLastName={prefillLastName}
                    requiredChains={requiredChains}
                />
            )}
        </Flex>
    );
};

const Order: React.FunctionComponent = () => (
    <>
        <McpCheckoutHydrator />
        <OrderContent />
    </>
);

export default Order;
