import * as React from "react";

import { Button, Flex, Form, Input } from "antd";

import type { CommentComposerProps } from "./types";

type CommentFormValues = {
    text: string;
};

export const CommentComposer: React.FunctionComponent<CommentComposerProps> = (props) => {
    const [form] = Form.useForm<CommentFormValues>();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleFinish = async (values: CommentFormValues) => {
        const text = values.text.trim();

        setIsSubmitting(true);
        try {
            await props.onSubmit(text);
            form.resetFields();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        if (props.onCancel) {
            props.onCancel();
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            className="CommentComposer"
            initialValues={{ text: props.initialValue ?? "" }}
            onFinish={handleFinish}
        >
            <Form.Item name="text" className="CommentComposer__field" rules={[{ required: true, whitespace: true }]}>
                <Input.TextArea placeholder={props.placeholder} autoSize={{ minRows: 3, maxRows: 8 }} />
            </Form.Item>
            <Flex gap={8} justify="flex-end" wrap className="CommentComposer__actions">
                {props.allowCancel && props.onCancel && (
                    <Button onClick={handleCancel} className="CommentComposer__cancelBtn">
                        {props.cancelLabel ?? "Cancel"}
                    </Button>
                )}
                <Button type="primary" htmlType="submit" loading={props.loading || isSubmitting} className="CommentComposer__submitBtn">
                    {props.submitLabel}
                </Button>
            </Flex>
        </Form>
    );
};
