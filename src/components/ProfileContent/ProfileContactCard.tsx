import * as React from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Button, Card, Divider, Form, Input, Space } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import useLocalStorage from "use-local-storage";

import { useUpdateUserByIdMutation } from "../hooks";
import { SAVED_SHIPPING_ADDRESS_STORAGE_KEY } from "../order/constants";
import { GeoapifyAddressFormItem } from "../order/GeoapifyAddressFormItem/GeoapifyAddressFormItem";
import type { AddressWithEmail } from "../order/types";

import { ProfileWalletsField } from "./ProfileWalletsField/ProfileWalletsField";
import type { ProfileContactFormValues, ProfileSelectedUser } from "./types";
import {
    buildProfileContactFormValues,
    buildProfileContactUpdateInput,
    validateSelectedProfileServerUser,
} from "./utils";

type ProfileContactCardProps = {
    messageApi: MessageInstance;
    selectedServerUrl: string;
    selectedServerUser?: ProfileSelectedUser | null;
    selectedServerUserLoading: boolean;
    onUserUpdated: () => Promise<void>;
};
export const ProfileContactCard: React.FunctionComponent<ProfileContactCardProps> = (props) => {
    const [form] = Form.useForm<ProfileContactFormValues>();
    const mutation = useUpdateUserByIdMutation();
    const queryClient = useQueryClient();
    const [savedShippingAddress, setSavedShippingAddress] = useLocalStorage<AddressWithEmail | undefined>(
        SAVED_SHIPPING_ADDRESS_STORAGE_KEY,
        undefined,
    );

    React.useEffect(() => {
        const values = buildProfileContactFormValues(props.selectedServerUser);
        form.setFieldValue("phone", values.phone);
        form.setFieldValue("shippingAddress", values.shippingAddress);
        form.setFieldValue("wallets", values.wallets);
    }, [form, props.selectedServerUrl, props.selectedServerUser]);

    const handleFinish = async (values: ProfileContactFormValues) => {
        try {
            await mutation.mutateAsync({
                id: props.selectedServerUser!.id,
                data: buildProfileContactUpdateInput(values, props.selectedServerUser),
                url: props.selectedServerUrl,
            });
            await queryClient.invalidateQueries({ queryKey: ["MeUser"] });
            await props.onUserUpdated();
            props.messageApi.success("Contact information updated");
        } catch (error) {
            console.error("Failed to update contact information", error);
            props.messageApi.error("Failed to update contact information");
        }
    };
    const handleResetSavedShippingAddress = () => {
        setSavedShippingAddress(undefined);
        props.messageApi.success("Saved shipping address was reset");
    };
    return (
        <Card title="Contact & Payment" size="small" className="Profile__card Profile__contactCard">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                disabled={props.selectedServerUserLoading}
            >
                <Form.Item
                    name="phone"
                    label="Phone number"
                    rules={[
                        {
                            validator: async () =>
                                validateSelectedProfileServerUser(
                                    props.selectedServerUrl,
                                    props.selectedServerUser?.id,
                                ),
                        },
                    ]}
                >
                    <Input placeholder="Phone number" />
                </Form.Item>
                <Divider />
                <div className="Profile__addressField">
                    <GeoapifyAddressFormItem name={["shippingAddress"]} label="Address" required />
                </div>
                <Divider />
                <ProfileWalletsField form={form} disabled={props.selectedServerUserLoading} />

                <Form.Item>
                    <Space wrap>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={mutation.isPending}
                            disabled={props.selectedServerUserLoading}
                        >
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
