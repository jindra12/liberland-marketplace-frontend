import * as React from "react";

import { Link } from "react-router-dom";

import { Alert, Button, Flex, Form, Skeleton, Typography } from "antd";

import { routes } from "../../routes";

import { DonationAmountField } from "./DonationAmountField";
import { useHostedCheckout } from "./useHostedCheckout";

interface HostedCheckoutFormProps {
    serverUrl: string;
    companyId: string;
    productId: string | null;
    quantity: number;
}

export const HostedCheckoutForm: React.FunctionComponent<HostedCheckoutFormProps> = (props) => {
    const { company, payment } = useHostedCheckout(props.serverUrl, props.companyId, props.productId, props.quantity);
    return (
        <Form
            layout="vertical"
            className="Publish__form HostedCheckoutForm"
            initialValues={{ amount: 10 }}
            onFinish={payment.mutate}
        >
            <Typography.Title level={2}>{props.productId ? "Product payment" : "Make a donation"}</Typography.Title>
            {company.isLoading && <Skeleton active paragraph={{ rows: 1 }} />}
            {company.data?.Company && (
                <Flex vertical gap={8} className="HostedCheckoutForm__recipient">
                    <Typography.Text type="secondary">
                        {props.productId ? "You're paying" : "You're supporting"}
                    </Typography.Text>
                    <Typography.Title level={3}>{company.data.Company.name}</Typography.Title>
                    <Link to={routes.companies.detail.getLink({ id: props.companyId, serverURL: props.serverUrl })}>
                        View company profile
                    </Link>
                </Flex>
            )}
            {(company.isError || (company.isSuccess && !company.data?.Company)) && (
                <Alert
                    type="error"
                    showIcon
                    message="Could not load the recipient. Please retry before continuing."
                    action={<Button onClick={() => company.refetch()}>Retry</Button>}
                />
            )}
            <Typography.Paragraph>
                Pay securely through Thirdweb without creating a Nswap account. This checkout settles in USDC on Base.
                Review the recipient and final amount before paying.
            </Typography.Paragraph>
            {!props.productId && <DonationAmountField />}
            {payment.error && <Alert type="error" showIcon message={payment.error.message} />}
            <Form.Item>
                <Button htmlType="submit" type="primary" loading={payment.isPending} disabled={!company.data?.Company}>
                    Continue to payment
                </Button>
            </Form.Item>
        </Form>
    );
};
