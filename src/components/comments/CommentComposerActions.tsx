import * as React from "react";

import { useAuth } from "react-oidc-context";

import { Button, Flex, Form, Input } from "antd";

import { EndpointAuthAction } from "../EndpointAuthAction";

import { CommentCompanyField } from "./CommentCompanyField";
import type { CommentComposerValues } from "./types";

type CommentComposerActionsProps = {
    placeholder: string;
    submitLabel: string;
    serverURL?: string | null;
    initialValue?: string;
    initialCompany?: string;
    showCompanyField?: boolean;
    cancelLabel?: string;
    allowCancel?: boolean;
    onCancel?: () => void;
    onSubmit: (values: CommentComposerValues) => Promise<void>;
};

export const CommentComposerActions: React.FunctionComponent<CommentComposerActionsProps> = (props) => {
    const auth = useAuth();
    const userId = auth.user?.profile?.sub;
    const [form] = Form.useForm<CommentComposerValues>();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleFinish = async (values: CommentComposerValues) => {
        if (props.showCompanyField && !values.company) {
            return;
        }

        setIsSubmitting(true);
        try {
            await props.onSubmit(values);
            form.resetFields();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            className="CommentComposer"
            initialValues={{
                text: props.initialValue ?? "",
                company: props.initialCompany,
            }}
            onFinish={handleFinish}
        >
            {props.showCompanyField && userId && (
                <CommentCompanyField serverURL={props.serverURL} userId={userId} />
            )}
            <Form.Item name="text" className="CommentComposer__field" rules={[{ required: true, whitespace: true }]}>
                <Input.TextArea placeholder={props.placeholder} autoSize={{ minRows: 3, maxRows: 8 }} />
            </Form.Item>
            <Flex gap={8} justify="flex-end" wrap className="CommentComposer__actions">
                {props.allowCancel && props.onCancel && (
                    <Button onClick={props.onCancel} className="CommentComposer__cancelBtn">
                        {props.cancelLabel ?? "Cancel"}
                    </Button>
                )}
                <EndpointAuthAction defaultAuthUrl={props.serverURL ? props.serverURL : undefined}>
                    {({ runWithAuthOrLogin }) => (
                        <Button
                            type="primary"
                            htmlType="button"
                            loading={isSubmitting}
                            className="CommentComposer__submitBtn"
                            onClick={(event) => {
                                event.preventDefault();
                                runWithAuthOrLogin(() => {
                                    form.submit();
                                });
                            }}
                        >
                            {props.submitLabel}
                        </Button>
                    )}
                </EndpointAuthAction>
            </Flex>
        </Form>
    );
};
