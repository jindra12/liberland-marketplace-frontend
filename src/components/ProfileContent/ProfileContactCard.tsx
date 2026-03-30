import * as React from "react";
import { Button, Card, Form, Input, message } from "antd";
import { useUpdateUserByIdMutation } from "../hooks";
import { GeoapifyAddressFormItem } from "../order/GeoapifyAddressFormItem/GeoapifyAddressFormItem";
import type { ProfileContactFormValues, ProfileSelectedUser } from "./types";
import {
    buildProfileContactFormValues,
    buildProfileContactUpdateInput,
    validateSelectedProfileServerUser,
} from "./utils";

type ProfileContactCardProps = {
    selectedServerUrl: string;
    selectedServerUser?: ProfileSelectedUser | null;
    selectedServerUserLoading: boolean;
    onUserUpdated: () => Promise<void>;
};

export const ProfileContactCard: React.FunctionComponent<ProfileContactCardProps> = ({
    selectedServerUrl,
    selectedServerUser,
    selectedServerUserLoading,
    onUserUpdated,
}) => {
    const [form] = Form.useForm<ProfileContactFormValues>();
    const mutation = useUpdateUserByIdMutation();

    React.useEffect(() => {
        form.resetFields();
    }, [form, selectedServerUrl]);

    React.useEffect(() => {
        form.setFieldsValue(buildProfileContactFormValues(selectedServerUser));
    }, [form, selectedServerUser]);

    const handleFinish = async (values: ProfileContactFormValues) => {
        try {
            await mutation.mutateAsync({
                id: selectedServerUser!.id,
                data: buildProfileContactUpdateInput(values, selectedServerUser),
                url: selectedServerUrl,
            });
            await onUserUpdated();
            message.success("Contact information updated");
        } catch (error) {
            console.error("Failed to update contact information", error);
            message.error("Failed to update contact information");
        }
    };

    return (
        <Card title="Contact Form" size="small" className="Profile__card Profile__contactCard">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                disabled={selectedServerUserLoading}
            >
                <Form.Item
                    name="phone"
                    label="Phone number"
                    rules={[
                        {
                            validator: async () => validateSelectedProfileServerUser(selectedServerUrl, selectedServerUser?.id),
                        },
                    ]}
                >
                    <Input placeholder="Phone number" />
                </Form.Item>

                <GeoapifyAddressFormItem name={["shippingAddress"]} label="Address" required={false} />

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={selectedServerUserLoading}>
                        Save Contact Information
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
