import * as React from "react";

import { Form, Input, Select } from "antd";
import type { UploadFile } from "antd/es/upload/interface";

import { useCreateCompanyMutation, useListIdentitiesQuery, useUpdateCompanyMutation } from "../hooks";

import { FormSubmitButtons } from "./FormSubmitButtons";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";
import { useEntityForm } from "./useEntityForm";

interface CompanyFormValues {
    name: string | null;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    identity?: string | null;
    imageFile?: UploadFile[];
}
export interface CompanyFormProps {
    mode: "create" | "edit";
    url: string;
    initialValues?: Partial<CompanyFormValues> & {
        id?: string | null;
        existingImageUrl?: string | null;
        existingImageId?: string | null;
    };
}
export const CompanyForm: React.FunctionComponent<CompanyFormProps> = (props) => {
    const createMutation = useCreateCompanyMutation();
    const updateMutation = useUpdateCompanyMutation();
    const identitiesQuery = useListIdentitiesQuery({
        limit: 100,
        url: props.url,
    });
    const identities = identitiesQuery.data?.Identities?.docs ?? [];
    const { form, draftRef, loading, onFinish } = useEntityForm({
        entityName: "Company",
        routePrefix: "/companies",
        mode: props.mode,
        existingImageId: props.initialValues?.existingImageId,
        editId: props.initialValues?.id,
        createMutation,
        updateMutation,
        url: props.url,
        buildData: (values: CompanyFormValues, imageId) => ({
            name: values.name,
            description: values.description,
            email: values.email,
            phone: values.phone,
            website: values.website,
            identity: values.identity,
            ...(imageId !== undefined && {
                image: imageId,
            }),
        }),
        getCreateId: (r) => r.createCompany?.id,
        getUpdateId: (r) => r.updateCompany?.id,
    });
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={props.initialValues}
            className="Publish__form"
        >
            <Form.Item
                name="name"
                label="Company Name"
                rules={[
                    {
                        required: true,
                    },
                ]}
                className="Publish__companyNameField"
            >
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" className="Publish__companyDescriptionField">
                <MarkdownEditor rows={6} placeholder="Supports Markdown formatting" />
            </Form.Item>
            <ImageUploadField existingImageUrl={props.initialValues?.existingImageUrl} serverUrl={props.url} />
            <Form.Item
                name="identity"
                label="Tribe"
                rules={[
                    {
                        required: true,
                        message: "Please select a tribe",
                    },
                ]}
                className="Publish__companyIdentityField"
            >
                <Select
                    loading={identitiesQuery.isLoading}
                    placeholder="Select a tribe"
                    options={identities.map((i) => ({
                        value: i.id,
                        label: i.name,
                    }))}
                />
            </Form.Item>
            <Form.Item name="email" label="Email" className="Publish__companyEmailField">
                <Input type="email" />
            </Form.Item>
            <Form.Item name="phone" label="Phone" className="Publish__companyPhoneField">
                <Input />
            </Form.Item>
            <Form.Item name="website" label="Website" className="Publish__companyWebsiteField">
                <Input />
            </Form.Item>
            <Form.Item>
                <FormSubmitButtons mode={props.mode} entityName="Company" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
