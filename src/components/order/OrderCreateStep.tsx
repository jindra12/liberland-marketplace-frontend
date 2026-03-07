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
    Typography,
} from "antd";
import type { FormInstance } from "antd";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { ListProductsQuery } from "../../generated/graphql";
import type { CryptoChain } from "../../types";
import { CRYPTO_CHAIN_LABELS } from "../../utils";
import { ProductServiceListInternal } from "../lists/ProductServiceListInternal";
import { GeoapifyAddressFormItem } from "./GeoapifyAddressFormItem";
import type { OrderFormValues } from "./types";

type OrderCreateStepProps = {
    form: FormInstance<OrderFormValues>;
    query: UseQueryResult<ListProductsQuery, unknown>;
    onSubmit: (values: OrderFormValues) => Promise<void>;
    page: number;
    setPage: (page: number) => void;
    isSubmitting: boolean;
    cartsWithItemsCount: number;
    profileEmail?: string;
    prefillFirstName?: string;
    prefillLastName?: string;
    requiredChains: CryptoChain[];
};

export const OrderCreateStep: React.FunctionComponent<OrderCreateStepProps> = (props) => {
    const requiredChainText = props.requiredChains
        .map((chain) => CRYPTO_CHAIN_LABELS[chain])
        .join(", ");

    return (
        <>
            <Typography.Paragraph type="secondary">
                One click will submit one order per server/cart using the same shipping and contact details.
            </Typography.Paragraph>

            {props.requiredChains.length > 0 && (
                <Alert
                    showIcon
                    type="info"
                    message={`Likely payment chains: ${requiredChainText}`}
                    description="This is based on wallet chains configured on products/companies currently in your carts."
                />
            )}

            <Form
                id="order-form"
                layout="vertical"
                form={props.form}
                onFinish={props.onSubmit}
                initialValues={{
                    customerEmail: props.profileEmail,
                    shippingAddress: {
                        country: "United States",
                        firstName: props.prefillFirstName,
                        lastName: props.prefillLastName,
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
                page={props.page}
                setPage={props.setPage}
                query={props.query}
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
                    loading={props.isSubmitting}
                    disabled={props.cartsWithItemsCount === 0}
                >
                    Create order
                </Button>
            </Flex>
        </>
    );
};
