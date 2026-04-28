import * as React from "react";

import { useAuth } from "react-oidc-context";

import { UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

import { useEndpointContext } from "../EndpointContext";
import { useUpdateUserByIdMutation } from "../hooks";

import type { NicknameFormValues } from "./types";
import { validateSelectedProfileServerUser } from "./utils";

type ProfileNicknameCardProps = {
    currentName?: string | null;
    messageApi: MessageInstance;
    selectedServerUrl: string;
    selectedServerUserId?: string;
    selectedServerUserLoading: boolean;
    onUserUpdated: () => Promise<void>;
};
export const ProfileNicknameCard: React.FunctionComponent<ProfileNicknameCardProps> = (props) => {
    const auth = useAuth();
    const { authUrl } = useEndpointContext();
    const [form] = Form.useForm<NicknameFormValues>();
    const mutation = useUpdateUserByIdMutation();

    React.useEffect(() => {
        form.setFieldValue("name", props.currentName);
    }, [form, props.currentName, props.selectedServerUrl]);

    const handleFinish = async (values: NicknameFormValues) => {
        try {
            await mutation.mutateAsync({
                id: props.selectedServerUserId!,
                data: {
                    name: values.name,
                },
                url: props.selectedServerUrl,
            });
            if (props.selectedServerUrl === authUrl && auth.isAuthenticated) {
                await auth.signinSilent();
            }
            await props.onUserUpdated();
            props.messageApi.success("Nickname updated");
            form.resetFields();
        } catch (error) {
            console.error("Failed to update nickname", error);
            props.messageApi.error("Failed to update nickname");
        }
    };
    return (
        <Card title="Change Nickname" size="small" className="Profile__card Profile__nicknameCard">
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: "Enter a nickname",
                        },
                        {
                            validator: async () =>
                                validateSelectedProfileServerUser(props.selectedServerUrl, props.selectedServerUserId),
                        },
                    ]}
                >
                    <Input prefix={<UserOutlined />} placeholder={props.currentName || "New nickname"} />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={mutation.isPending}
                        disabled={props.selectedServerUserLoading}
                    >
                        Update
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
