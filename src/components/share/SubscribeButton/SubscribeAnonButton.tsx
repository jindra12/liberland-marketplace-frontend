import * as React from "react";
import { BellOutlined } from "@ant-design/icons";
import {
    Button,
    Form,
    Input,
    Modal,
    Typography,
    message,
} from "antd";
import { useSubscriptionActions } from "./useSubscriptionActions";
import {
    getSubscribeButtonClassName,
    getSubscriptionErrorMessage,
} from "./utils";
import type {
    AnonymousSubscribeFormValues,
    SubscribeButtonProps,
} from "./types";

export const SubscribeAnonButton: React.FunctionComponent<SubscribeButtonProps> = ({
    collection,
    targetID,
    serverURL,
    subscriptionID,
    block,
    className,
    onSubscriptionChange,
    size = "middle",
    type = "default",
}) => {
    const [form] = Form.useForm<AnonymousSubscribeFormValues>();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const { entityLabel, isPending, subscribe } = useSubscriptionActions({
        collection,
        targetID,
        serverURL,
        subscriptionID,
    });

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (!targetID) {
            return;
        }

        setIsModalOpen(true);
    };

    const handleClose = () => {
        if (isPending) {
            return;
        }

        setIsModalOpen(false);
        form.resetFields();
    };

    const handleFinish = async (values: AnonymousSubscribeFormValues) => {
        try {
            await subscribe(values.email);
            setIsModalOpen(false);
            form.resetFields();
            onSubscriptionChange?.(true);
            message.success(`We'll send ${entityLabel} updates to ${values.email}.`);
        } catch (error) {
            message.error(getSubscriptionErrorMessage(error, "subscribe", entityLabel));
        }
    };

    return (
        <>
            <Button
                icon={<BellOutlined />}
                size={size}
                type={type}
                block={block}
                disabled={!targetID}
                className={getSubscribeButtonClassName(className)}
                onClick={handleOpen}
                loading={isPending}
            >
                Subscribe
            </Button>
            <Modal
                open={isModalOpen}
                title="Subscribe to updates"
                okText="Subscribe"
                cancelText="Cancel"
                confirmLoading={isPending}
                onCancel={handleClose}
                onOk={() => form.submit()}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        void handleFinish(values);
                    }}
                >
                    <Typography.Paragraph className="SubscribeButton__modalCopy">
                        Enter your email and we&apos;ll notify you when this {entityLabel} changes.
                    </Typography.Paragraph>
                    <Form.Item
                        name="email"
                        label="Email address"
                        rules={[
                            { required: true, message: "Enter an email address" },
                            { type: "email", message: "Enter a valid email address" },
                        ]}
                    >
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
