import * as React from "react";

import { useAuth } from "react-oidc-context";

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Typography } from "antd";

import { EndpointAuthAction } from "../EndpointAuthAction";

import type { ReportActionProps } from "./types";
import { useReportAction } from "./useReportAction";

export const ReportAction: React.FunctionComponent<ReportActionProps> = (props) => {
    const auth = useAuth();
    const state = useReportAction(props);

    return (
        <>
            <EndpointAuthAction defaultAuthUrl={state.reportServerURL}>
                {({ runWithAuthOrLogin }) => (
                    <Button
                        danger
                        type="text"
                        aria-label="Report content"
                        icon={<ExclamationCircleOutlined />}
                        className={["ShareSection__reportButton", props.className].filter(Boolean).join(" ")}
                        size={props.size}
                        disabled={state.disabled}
                        onClick={async (event) => {
                            event.preventDefault();
                            if (auth.isAuthenticated) {
                                await state.openReport();
                                return;
                            }

                            await runWithAuthOrLogin(
                                async () => {
                                    await state.openReport();
                                },
                            );
                        }}
                    />
                )}
            </EndpointAuthAction>
            <Modal
                open={state.isOpen}
                title="Report content"
                okText="Report"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: state.isSubmitting }}
                onOk={() => {
                    state.form.submit();
                }}
                onCancel={state.closeReport}
                destroyOnHidden
            >
                <Typography.Paragraph>
                    Tell us what is wrong with this content. Keep it short and specific.
                </Typography.Paragraph>
                <Form form={state.form} layout="vertical" onFinish={state.submitReport}>
                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, whitespace: true, message: "Tell us why you are reporting this." }]}
                    >
                        <Input.TextArea
                            autoSize={{ minRows: 4, maxRows: 8 }}
                            placeholder="Explain what should be reviewed"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
