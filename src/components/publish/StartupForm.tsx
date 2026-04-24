import * as React from "react";

import { Form } from "antd";

import { FormSubmitButtons } from "./FormSubmitButtons";
import { StartupFormBasicsFields } from "./startupForm/StartupFormBasicsFields";
import { StartupFormResourcesFields } from "./startupForm/StartupFormResourcesFields";
import type { StartupFormProps } from "./startupForm/types";
import { useStartupFormModel } from "./startupForm/useStartupFormModel";

export { type StartupFormProps } from "./startupForm/types";

export const StartupForm: React.FunctionComponent<StartupFormProps> = (props) => {
    const startupFormModel = useStartupFormModel(props);

    return (
        <Form
            form={startupFormModel.form}
            layout="vertical"
            onFinish={startupFormModel.onFinish}
            initialValues={startupFormModel.defaults}
            className="Publish__form"
        >
            <StartupFormBasicsFields
                existingImageUrl={props.initialValues?.existingImageUrl}
                identityOptions={startupFormModel.identityOptions}
                isIdentitiesLoading={startupFormModel.isIdentitiesLoading}
                userId={startupFormModel.userId}
                url={props.url}
            />
            <StartupFormResourcesFields />
            <Form.Item>
                <FormSubmitButtons
                    mode={props.mode}
                    entityName="Venture"
                    loading={startupFormModel.loading}
                    draftRef={startupFormModel.draftRef}
                />
            </Form.Item>
        </Form>
    );
};
