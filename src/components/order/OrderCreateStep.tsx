import * as React from "react";
import { Alert, Button, Card, Col, Flex, Form, Input, Row, Typography } from "antd";
import type { FormInstance } from "antd";
import type { ListProductsQuery } from "../../generated/graphql";
import type { CryptoChain } from "../../types";
import { CRYPTO_CHAIN_LABELS } from "../../utils";
import { ProductServiceListInternal } from "../lists/ProductServiceListInternal";
import { GeoapifyAddressFormItem } from "./GeoapifyAddressFormItem/GeoapifyAddressFormItem";
import { ShippingAddressSelectModal } from "./ShippingAddressSelectModal";
import { buildOrderFormValues } from "./utils";
import type { AddressWithEmail, OrderFormValues } from "./types";
import { RouteButton } from "../RouteButton";

type OrderCreateStepProps = {
    form: FormInstance<OrderFormValues>;
    products: NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>;
    isProductsLoading: boolean;
    refetchProducts: () => Promise<void>;
    onSubmit: (values: OrderFormValues) => Promise<void>;
    page: number;
    setPage: (page: number) => void;
    isSubmitting: boolean;
    cartsWithItemsCount: number;
    candidateProfileAddresses: AddressWithEmail[];
    isLoadingProfileAddresses: boolean;
    savedShippingAddress?: AddressWithEmail;
    onSelectSavedShippingAddress: (id: string) => void;
    profileEmail?: string;
    prefillFirstName?: string;
    prefillLastName?: string;
    requiredChains: CryptoChain[];
};

export const OrderCreateStep: React.FunctionComponent<OrderCreateStepProps> = (props) => {
    const [isShippingAddressSelectOpen, setIsShippingAddressSelectOpen] = React.useState(false);
    const requiredChainText = props.requiredChains.map((chain) => CRYPTO_CHAIN_LABELS[chain]).join(", ");

    React.useEffect(() => {
        props.form.setFieldsValue(
            buildOrderFormValues({
                prefillFirstName: props.prefillFirstName,
                prefillLastName: props.prefillLastName,
                profileEmail: props.profileEmail,
                savedShippingAddress: props.savedShippingAddress,
            }),
        );
    }, [props.form, props.prefillFirstName, props.prefillLastName, props.profileEmail, props.savedShippingAddress]);

    return (
        <>
            <Typography.Paragraph type="secondary">One click will submit one order per server/cart using the same shipping and contact details.</Typography.Paragraph>

            {props.requiredChains.length > 0 && <Alert showIcon type="info" message="Payment information" description={`You'll pay on ${requiredChainText}`} />}

            <Form
                id="order-form"
                layout="vertical"
                form={props.form}
                onFinish={props.onSubmit}
                initialValues={buildOrderFormValues({
                    prefillFirstName: props.prefillFirstName,
                    prefillLastName: props.prefillLastName,
                    profileEmail: props.profileEmail,
                    savedShippingAddress: props.savedShippingAddress,
                })}
            >
                <Card
                    title="Shipping"
                    extra={
                        props.candidateProfileAddresses.length > 0 && (
                            <Button
                                size="small"
                                onClick={() => {
                                    setIsShippingAddressSelectOpen(true);
                                }}
                                loading={props.isLoadingProfileAddresses}
                            >
                                Choose default address
                            </Button>
                        )
                    }
                >
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
                            <Form.Item name={["shippingAddress", "firstName"]} label="First name" rules={[{ required: true, message: "Required" }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name={["shippingAddress", "lastName"]} label="Last name" rules={[{ required: true, message: "Required" }]}>
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
                source="static"
                page={props.page}
                setPage={props.setPage}
                products={props.products}
                isLoading={props.isProductsLoading}
                hasNextPage={false}
                refetch={props.refetchProducts}
                title="Order summary"
                showOrderNowFallback={false}
            />

            <Flex justify="space-between" wrap gap={12}>
                <RouteButton to="/cart">Back to cart</RouteButton>
                <Button type="primary" htmlType="submit" form="order-form" loading={props.isSubmitting} disabled={props.cartsWithItemsCount === 0}>
                    Create order
                </Button>
            </Flex>

            <ShippingAddressSelectModal
                open={isShippingAddressSelectOpen}
                loading={false}
                options={props.candidateProfileAddresses}
                selectedKey={props.savedShippingAddress?.id}
                onCancel={() => {
                    setIsShippingAddressSelectOpen(false);
                }}
                onSelect={(id) => {
                    props.onSelectSavedShippingAddress(id);
                    setIsShippingAddressSelectOpen(false);
                }}
            />
        </>
    );
};
