import * as React from "react";

import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { Alert, Button, Form } from "antd";
import type { FormInstance } from "antd";

import type { ProfileContactFormValues, ProfileWalletSelection, ProfileWalletSelectionTarget } from "../types";

import { ProfileWalletRow } from "./ProfileWalletRow";

type ProfileWalletsFieldProps = {
    disabled?: boolean;
    form: FormInstance<ProfileContactFormValues>;
};

export const ProfileWalletsField: React.FunctionComponent<ProfileWalletsFieldProps> = (props) => {
    const [selectionTarget, setSelectionTarget] = React.useState<ProfileWalletSelectionTarget>(null);

    const handleWalletSelected = (name: number, wallet: ProfileWalletSelection) => {
        props.form.setFieldValue(["wallets", name, "provider"], wallet.provider);
        props.form.setFieldValue(["wallets", name, "address"], wallet.address);
        setSelectionTarget(null);
    };

    const handleSelectionStart = (name: number) => {
        setSelectionTarget({ name });
    };

    const handleSelectionClear = () => {
        setSelectionTarget(null);
    };

    return (
        <div className="Profile__walletField">
            <Alert
                className="Profile__walletHint"
                message="These wallets can be used during payment. Wallets nearer the top are preferred first, so put your favourites higher on the list."
                type="info"
                showIcon
            />
            <Form.List name="wallets">
                {(fields, { add, move, remove }) => (
                    <div className="Profile__walletList">
                        {fields.map((field, index) => (
                            <ProfileWalletRow
                                key={field.key}
                                canMoveDown={index < fields.length - 1}
                                canMoveUp={index > 0}
                                disabled={props.disabled}
                                field={field}
                                form={props.form}
                                move={move}
                                onSelectionClear={handleSelectionClear}
                                onSelectionStart={handleSelectionStart}
                                onWalletSelected={handleWalletSelected}
                                remove={remove}
                                selectionTarget={selectionTarget}
                            />
                        ))}
                        <Button
                            className="Profile__walletAddButton"
                            disabled={props.disabled}
                            icon={<PlusOutlined />}
                            onClick={() => add({})}
                        >
                            Add payment wallet
                        </Button>
                    </div>
                )}
            </Form.List>
        </div>
    );
};
