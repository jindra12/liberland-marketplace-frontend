import * as React from "react";
import { UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd";
import { useAuth } from "react-oidc-context";
import { useEndpointContext } from "../EndpointContext";
import { useUpdateUserByIdMutation } from "../hooks";
import type { NicknameFormValues } from "./types";
import { validateSelectedProfileServerUser } from "./utils";

type ProfileNicknameCardProps = {
    currentName?: string | null;
    selectedServerUrl: string;
    selectedServerUserId?: string;
    selectedServerUserLoading: boolean;
    onUserUpdated: () => Promise<void>;
};

export const ProfileNicknameCard: React.FunctionComponent<ProfileNicknameCardProps> = ({
    currentName,
    selectedServerUrl,
    selectedServerUserId,
    selectedServerUserLoading,
    onUserUpdated,
}) => {
    const auth = useAuth();
    const { authUrl } = useEndpointContext();
    const [form] = Form.useForm<NicknameFormValues>();
    const mutation = useUpdateUserByIdMutation();

    React.useEffect(() => {
        form.resetFields();
    }, [form, selectedServerUrl]);

    const handleFinish = async (values: NicknameFormValues) => {
        try {
            await mutation.mutateAsync({
                id: selectedServerUserId!,
                data: {
                    name: values.name,
                },
                url: selectedServerUrl,
            });

            if (selectedServerUrl === authUrl && auth.isAuthenticated) {
                await auth.signinSilent();
            }

            await onUserUpdated();
            message.success("Nickname updated");
            form.resetFields();
        } catch (error) {
            console.error("Failed to update nickname", error);
            message.error("Failed to update nickname");
        }
    };

    return (
        <Card title="Change Nickname" size="small" className="Profile__card">
            <Form form={form} layout="inline" onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    rules={[
                        { required: true, message: "Enter a nickname" },
                        {
                            validator: async () => validateSelectedProfileServerUser(selectedServerUrl, selectedServerUserId),
                        },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder={currentName || "New nickname"}
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={mutation.isPending}
                        disabled={selectedServerUserLoading}
                    >
                        Update
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
