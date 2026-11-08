import React from "react";
import { Button, Space, Typography } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useEntityForm } from "../../../src/components/publish/useEntityForm";
import type { EntityFormTestConfig } from "./types";

interface PublicationFailureProbeProps {
    config: EntityFormTestConfig;
    file: UploadFile;
    onEscapedFailure: (error: Error) => void;
}

export const PublicationFailureProbe: React.FunctionComponent<PublicationFailureProbeProps> = (props) => {
    const model = useEntityForm(props.config);
    const [settled, setSettled] = React.useState(false);

    return (
        <Space>
            <Button
                onClick={async () => {
                    try {
                        await model.onFinish({ name: "Fixture company", imageFile: [props.file] });
                    } catch (error) {
                        if (!(error instanceof Error)) {
                            throw error;
                        }
                        // Observe a rejection at the caller boundary without suppressing Cypress errors globally.
                        props.onEscapedFailure(error);
                    } finally {
                        setSettled(true);
                    }
                }}
            >
                Publish
            </Button>
            <Typography.Text data-cy="publication-state">{settled ? "settled" : "ready"}</Typography.Text>
        </Space>
    );
};
