import * as React from "react";

import { useAuth } from "react-oidc-context";

import { useQueryClient } from "@tanstack/react-query";

import { UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

import { useEndpointContext } from "../EndpointContext";
import { TEXT_INPUT_MAX_LENGTH, buildMaxLengthRule } from "../form/constants";
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
    const queryClient = useQueryClient();

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
            await queryClient.invalidateQueries({ queryKey: ["MeUser"] });
            await props.onUserUpdated();
            props.messageApi.success("Nickname updated");
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
                        buildMaxLengthRule(TEXT_INPUT_MAX_LENGTH),
                        {
                            validator: async () =>
                                validateSelectedProfileServerUser(props.selectedServerUrl, props.selectedServerUserId),
                        },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder={props.currentName || "New nickname"}
                    />
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
