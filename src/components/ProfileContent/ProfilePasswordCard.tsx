import * as React from "react";

import { Button, Card, Form, Input, message } from "antd";

import { useChangePasswordMutation } from "../../authApi";

import type { PasswordFormValues } from "./types";
import { validateSelectedProfileServerUrl } from "./utils";

type ProfilePasswordCardProps = {
    selectedServerUrl: string;
};
export const ProfilePasswordCard: React.FunctionComponent<ProfilePasswordCardProps> = (props) => {
    const [form] = Form.useForm<PasswordFormValues>();
    const mutation = useChangePasswordMutation();

    React.useEffect(() => {
        form.resetFields();
    }, [form, props.selectedServerUrl]);

    const handleFinish = async (values: PasswordFormValues) => {
        try {
            await mutation.mutateAsync({
                url: props.selectedServerUrl,
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            message.success("Password changed");
            form.resetFields();
        } catch (error) {
            console.error("Failed to change password", error);
            message.error("Failed to change password");
        }
    };
    return (
        <Card title="Change Password" size="small" className="Profile__card">
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="currentPassword"
                    rules={[
                        {
                            required: true,
                            message: "Enter current password",
                        },
                        {
                            validator: async () => validateSelectedProfileServerUrl(props.selectedServerUrl),
                        },
                    ]}
                >
                    <Input.Password placeholder="Current password" />
                </Form.Item>
                <Form.Item
                    name="newPassword"
                    rules={[
                        {
                            required: true,
                            min: 6,
                            message: "Min 6 characters",
                        },
                    ]}
                >
                    <Input.Password placeholder="New password" />
                </Form.Item>
                <Form.Item
                    name="confirm"
                    dependencies={["newPassword"]}
                    rules={[
                        {
                            required: true,
                            message: "Confirm password",
                        },
                        ({ getFieldValue }) => ({
                            validator: async (_, value) => {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return;
                                }
                                throw new Error("Passwords do not match");
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirm new password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                        Change Password
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
