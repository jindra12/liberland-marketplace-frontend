import * as React from "react";

import { Card, Form, Input, Select } from "antd";

import type { ProfileServerOption } from "./types";

type ProfileAccountServerCardProps = {
    onChangeServer: (value: string) => void;
    profileServerOptions: ProfileServerOption[];
    selectedServerLabel: string;
    selectedServerUrl: string;
};
export const ProfileAccountServerCard: React.FunctionComponent<ProfileAccountServerCardProps> = (props) => {
    return (
        <Card title="Account Server" size="small" className="Profile__card Profile__serverCard">
            {props.profileServerOptions.length > 1 ? (
                <Form layout="vertical">
                    <Form.Item label="Apply nickname and password changes on" className="Profile__serverField">
                        <Select
                            value={props.selectedServerUrl}
                            options={props.profileServerOptions}
                            onChange={props.onChangeServer}
                        />
                    </Form.Item>
                </Form>
            ) : (
                <Form layout="vertical">
                    <Form.Item label="Apply nickname and password changes on" className="Profile__serverField">
                        <Input value={props.selectedServerLabel} readOnly />
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
};
