import * as React from "react";

import { useAuth } from "react-oidc-context";

import { RetweetOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Typography } from "antd";

import { CompanyField } from "../CompanyField";
import { EndpointAuthAction } from "../EndpointAuthAction/EndpointAuthAction";
import { MarkdownEditor } from "../publish/MarkdownEditor";

import type { ShareRepostActionProps } from "./useShareRepostAction";
import { useShareRepostAction } from "./useShareRepostAction";

export const ShareRepostAction: React.FunctionComponent<ShareRepostActionProps> = (props) => {
    const auth = useAuth();
    const state = useShareRepostAction(props);
    const userId = auth.user?.profile?.sub;

    return (
        <>
            <EndpointAuthAction defaultAuthUrl={props.serverURL}>
                {({ runWithAuthOrLogin }) => (
                    <Button
                        type="primary"
                        shape="circle"
                        aria-label="Repost content"
                        icon={<RetweetOutlined />}
                        className={["ShareSection__repostButton", props.className].filter(Boolean).join(" ")}
                        disabled={state.disabled}
                        onClick={async (event) => {
                            event.preventDefault();
                            if (auth.isAuthenticated) {
                                await state.openRepost();
                                return;
                            }

                            await runWithAuthOrLogin(async () => {
                                await state.openRepost();
                            });
                        }}
                    />
                )}
            </EndpointAuthAction>
            <Modal
                open={state.isOpen}
                title="Add your take"
                okText="Repost"
                cancelText="Cancel"
                okButtonProps={{ loading: state.isSubmitting }}
                onOk={() => {
                    state.form.submit();
                }}
                onCancel={state.closeRepost}
                destroyOnHidden
            >
                <Typography.Paragraph>
                    Share a short note with this repost. Markdown is supported.
                </Typography.Paragraph>
                <Form form={state.form} layout="vertical" onFinish={state.submitRepost}>
                    <Form.Item
                        name="companyId"
                        label="Company"
                        rules={[
                            {
                                required: true,
                                message: "Please select a company",
                            },
                        ]}
                    >
                        <CompanyField serverURL={props.serverURL} userId={userId} allowPrivate />
                    </Form.Item>
                    <Form.Item name="description" label="Your take">
                        <MarkdownEditor
                            rows={6}
                            placeholder="Add a short note, context, or commentary. Markdown is supported."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
