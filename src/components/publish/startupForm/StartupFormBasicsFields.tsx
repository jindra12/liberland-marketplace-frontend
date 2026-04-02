import * as React from "react";

import { Form, Input, Select } from "antd";

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
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
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
            >
                <Select
                    loading={props.isCompaniesLoading}
                    placeholder="Select a company"
                    options={props.companyOptions}
                />
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
            >
                <Select
                    loading={props.isIdentitiesLoading}
                    placeholder="Select a tribe"
                    options={props.identityOptions}
                />
            </Form.Item>
        </>
    );
};
