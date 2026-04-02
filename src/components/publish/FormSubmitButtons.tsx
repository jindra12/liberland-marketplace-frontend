import React from "react";
import { Button, Space } from "antd";
interface FormSubmitButtonsProps {
    mode: "create" | "edit";
    entityName: string;
    loading: boolean;
    draftRef: React.MutableRefObject<boolean>;
}
export const FormSubmitButtons: React.FunctionComponent<FormSubmitButtonsProps> = (props) => {
    return (
        <Space>
            <Button
                type="primary"
                htmlType="submit"
                loading={props.loading}
                onClick={() => {
                    props.draftRef.current = false;
                }}
            >
                {props.mode === "edit" ? "Publish" : `Publish ${props.entityName}`}
            </Button>
            <Button
                htmlType="submit"
                loading={props.loading}
                onClick={() => {
                    props.draftRef.current = true;
                }}
            >
                Save as Draft
            </Button>
        </Space>
    );
};
