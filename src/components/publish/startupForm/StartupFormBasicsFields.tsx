import * as React from "react";

import { Form, Input, Select } from "antd";

import { CompanyField } from "../../CompanyField";
import { LONG_TEXT_INPUT_MAX_LENGTH, TEXT_INPUT_MAX_LENGTH, buildMaxLengthRule } from "../../form/constants";
import { ImageUploadField } from "../ImageUploadField";
import { MarkdownEditor } from "../MarkdownEditor";

import type { StartupFormBasicsFieldsProps } from "./types";

export const StartupFormBasicsFields: React.FunctionComponent<StartupFormBasicsFieldsProps> = (props) => {
    return (
        <>
            <Form.Item
                name="title"
                label="Venture Name"
                rules={[
                    {
                        required: true,
                    },
                    buildMaxLengthRule(TEXT_INPUT_MAX_LENGTH),
                ]}
                className="Publish__startupTitleField"
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="description"
                label="Description"
                rules={[buildMaxLengthRule(LONG_TEXT_INPUT_MAX_LENGTH)]}
                className="Publish__startupDescriptionField"
            >
                <MarkdownEditor rows={6} placeholder="Describe your venture (supports Markdown)" />
            </Form.Item>
            <ImageUploadField existingImageUrl={props.existingImageUrl} serverUrl={props.url} />
            <Form.Item
                name="company"
                label="Company"
                rules={[
                    {
                        required: true,
                        message: "Please select a company",
                    },
                ]}
                className="Publish__startupCompanyField"
            >
                <CompanyField serverURL={props.url} userId={props.userId} />
            </Form.Item>
            <Form.Item
                name="identity"
                label="Tribe"
                rules={[
                    {
                        required: true,
                        message: "Please select a tribe",
                    },
                ]}
                className="Publish__startupIdentityField"
            >
                <Select loading={props.isIdentitiesLoading} placeholder="Select a tribe" options={props.identityOptions} />
            </Form.Item>
        </>
    );
};
