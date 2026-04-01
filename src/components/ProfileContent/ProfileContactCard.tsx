import * as React from "react";
import { Button, Card, Form, Input, Space, message } from "antd";
import useLocalStorage from "use-local-storage";
import { useUpdateUserByIdMutation } from "../hooks";
import { GeoapifyAddressFormItem } from "../order/GeoapifyAddressFormItem/GeoapifyAddressFormItem";
import { SAVED_SHIPPING_ADDRESS_STORAGE_KEY } from "../order/constants";
import type { AddressWithEmail } from "../order/types";
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
    const [savedShippingAddress, setSavedShippingAddress] = useLocalStorage<AddressWithEmail | undefined>(
        SAVED_SHIPPING_ADDRESS_STORAGE_KEY,
        undefined,
    );

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

    const handleResetSavedShippingAddress = () => {
        setSavedShippingAddress(undefined);
        message.success("Saved shipping address was reset");
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
                    <Space wrap>
                        <Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={selectedServerUserLoading}>
                            Save Contact Information
                        </Button>
                        <Button danger onClick={handleResetSavedShippingAddress} disabled={!savedShippingAddress}>
                            Reset Saved Shipping Address
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};
