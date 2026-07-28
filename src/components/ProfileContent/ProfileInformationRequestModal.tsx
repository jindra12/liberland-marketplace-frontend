import * as React from "react";

import { Form, Input, Modal, Typography } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

import { LONG_TEXT_INPUT_MAX_LENGTH, buildMaxLengthRule } from "../form/constants";
import { useCreateInformationRequestMutation } from "../hooks";

import type { InformationRequestFormValues } from "./types";

type ProfileInformationRequestModalProps = {
    messageApi: MessageInstance;
    onClose: () => void;
    open: boolean;
    selectedServerUrl: string;
};

export const ProfileInformationRequestModal: React.FunctionComponent<ProfileInformationRequestModalProps> = (props) => {
    const [form] = Form.useForm<InformationRequestFormValues>();
    const mutation = useCreateInformationRequestMutation();

    const handleClose = () => {
        if (mutation.isPending) {
            return;
        }

        props.onClose();
        form.resetFields();
    };

    const handleFinish = async (values: InformationRequestFormValues) => {
        try {
            await mutation.mutateAsync({
                data: {
                    reason: values.reason,
                },
                url: props.selectedServerUrl,
            });
            props.messageApi.success("Your request has been sent");
            props.onClose();
            form.resetFields();
        } catch (error) {
            console.error("Failed to submit information request", error);
            props.messageApi.error("Failed to send your request");
        }
    };

    return (
        <Modal
            open={props.open}
            title="Request information"
            okText="Send request"
            cancelText="Cancel"
            okButtonProps={{ loading: mutation.isPending }}
            onOk={() => form.submit()}
            onCancel={handleClose}
            destroyOnHidden
        >
            <Typography.Paragraph>
                Use this form to ask for access, correction, deletion, or export of the information linked to your
                account.
            </Typography.Paragraph>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="reason"
                    label="What do you need?"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: "Tell us what you want to request.",
                        },
                        buildMaxLengthRule(LONG_TEXT_INPUT_MAX_LENGTH),
                    ]}
                >
                    <Input.TextArea
                        autoSize={{ minRows: 4, maxRows: 8 }}
                        placeholder="Explain your request"
                        showCount={{
                            formatter: ({ count, maxLength }) =>
                                `${Math.max((maxLength ?? LONG_TEXT_INPUT_MAX_LENGTH) - count, 0)} characters left`,
                        }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
