import React from "react";
import { Button, Space } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useEntityForm } from "../../../src/components/publish/useEntityForm";
import type { EntityFormTestConfig } from "./types";

interface UploadSubmissionProbeProps {
    config: EntityFormTestConfig;
    file: UploadFile;
}

export const UploadSubmissionProbe: React.FunctionComponent<UploadSubmissionProbeProps> = (props) => {
    const model = useEntityForm(props.config);
    return (
        <Space>
            <Button
                loading={model.loading}
                disabled={model.loading}
                onClick={async () => {
                    model.draftRef.current = false;
                    await model.onFinish({ name: "Company fixture", imageFile: [props.file] });
                }}
            >
                Publish
            </Button>
            <Button
                loading={model.loading}
                disabled={model.loading}
                onClick={async () => {
                    model.draftRef.current = true;
                    await model.onFinish({ name: "Company fixture", imageFile: [props.file] });
                }}
            >
                Save draft
            </Button>
        </Space>
    );
};
