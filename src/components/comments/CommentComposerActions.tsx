import * as React from "react";

import { useMutation } from "@tanstack/react-query";

import { Alert, Button, Flex, Form, Input } from "antd";

import { EndpointAuthAction } from "../EndpointAuthAction/EndpointAuthAction";
import { LONG_TEXT_INPUT_MAX_LENGTH, buildMaxLengthRule } from "../form/constants";

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
    const [form] = Form.useForm<CommentComposerValues>();
    const submission = useMutation({
        mutationFn: props.onSubmit,
        onSuccess: () => form.resetFields(),
        onError: (error) => console.error(error),
    });

    return (
        <Form
            form={form}
            layout="vertical"
            className="CommentComposer"
            initialValues={{
                text: props.initialValue ?? "",
                company: props.initialCompany,
            }}
            onFinish={(values) => {
                if (props.showCompanyField && !values.company) {
                    return;
                }
                submission.mutate(values);
            }}
        >
            {props.showCompanyField && <CommentCompanyField serverURL={props.serverURL} />}
            <Form.Item
                name="text"
                className="CommentComposer__field"
                rules={[{ required: true, whitespace: true }, buildMaxLengthRule(LONG_TEXT_INPUT_MAX_LENGTH)]}
            >
                <Input.TextArea
                    placeholder={props.placeholder}
                    autoSize={{ minRows: 3, maxRows: 8 }}
                    showCount={{
                        formatter: ({ count, maxLength }) =>
                            `${Math.max((maxLength ?? LONG_TEXT_INPUT_MAX_LENGTH) - count, 0)} characters left`,
                    }}
                />
            </Form.Item>
            {submission.error && (
                <Alert
                    type="error"
                    showIcon
                    message="Could not save the comment. Your text has been kept; please try again."
                />
            )}
            <Flex gap={8} justify="flex-end" wrap className="CommentComposer__actions">
                {props.allowCancel && props.onCancel && (
                    <Button onClick={props.onCancel} className="CommentComposer__cancelBtn">
                        {props.cancelLabel ?? "Cancel"}
                    </Button>
                )}
                <EndpointAuthAction defaultAuthUrl={props.serverURL} requireVerifiedEmail>
                    {({ runWithAuthOrLogin }) => (
                        <Button
                            type="primary"
                            htmlType="button"
                            loading={submission.isPending}
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
