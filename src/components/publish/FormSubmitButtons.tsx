import React from "react";
import { Button, Space } from "antd";

interface FormSubmitButtonsProps {
    mode: "create" | "edit";
    entityName: string;
    loading: boolean;
    draftRef: React.MutableRefObject<boolean>;
}

export const FormSubmitButtons: React.FunctionComponent<FormSubmitButtonsProps> = ({
    mode,
    entityName,
    loading,
    draftRef,
}) => (
    <Space>
        <Button type="primary" htmlType="submit" loading={loading} onClick={() => { draftRef.current = false; }}>
            {mode === "edit" ? "Publish" : `Publish ${entityName}`}
        </Button>
        <Button htmlType="submit" loading={loading} onClick={() => { draftRef.current = true; }}>
            Save as Draft
        </Button>
    </Space>
);
