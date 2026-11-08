import React from "react";
import { Button, Form, Input } from "antd";
import { useEntityForm } from "../../../src/components/publish/useEntityForm";
import type { EntityFormTestConfig } from "./types";

interface EntityFormProbeProps {
    config: EntityFormTestConfig;
}

export const EntityFormProbe: React.FunctionComponent<EntityFormProbeProps> = (props) => {
    const model = useEntityForm(props.config);
    return (
        <Form form={model.form} onFinish={model.onFinish} initialValues={{ name: "Company fixture" }}>
            <Form.Item name="name" label="Name">
                <Input />
            </Form.Item>
            <Button htmlType="submit" loading={model.loading}>
                Save company
            </Button>
        </Form>
    );
};
