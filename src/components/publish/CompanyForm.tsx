import React from "react";
import { Form, Input, Select } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useListIdentitiesQuery,
} from "../../generated/graphql";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";
import { FormSubmitButtons } from "./FormSubmitButtons";
import { useEntityForm } from "./useEntityForm";
import { stripEmpty } from "./formUtils";

interface CompanyFormValues {
    name: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    identity?: string;
    imageFile?: UploadFile[];
}

export interface CompanyFormProps {
    mode: "create" | "edit";
    initialValues?: Partial<CompanyFormValues> & {
        id?: string;
        existingImageUrl?: string;
        existingImageId?: string;
    };
}

export const CompanyForm: React.FunctionComponent<CompanyFormProps> = ({ mode, initialValues }) => {
    const createMutation = useCreateCompanyMutation();
    const updateMutation = useUpdateCompanyMutation();

    const identitiesQuery = useListIdentitiesQuery({ limit: 100 });
    const identities = identitiesQuery.data?.Identities?.docs ?? [];

    const { form, draftRef, loading, onFinish } = useEntityForm<CompanyFormValues, typeof createMutation extends { mutateAsync: (...args: never[]) => Promise<infer R> } ? R : never, typeof updateMutation extends { mutateAsync: (...args: never[]) => Promise<infer R> } ? R : never>({
        entityName: "Company",
        routePrefix: "/companies",
        mode,
        existingImageId: initialValues?.existingImageId,
        editId: initialValues?.id,
        createMutation,
        updateMutation,
        buildData: (values, imageId) => {
            const data: Record<string, unknown> = stripEmpty({
                name: values.name,
                description: values.description ?? "",
                email: values.email ?? "",
                phone: values.phone ?? "",
                website: values.website ?? "",
                identity: values.identity ?? "",
            });
            if (imageId !== undefined) data.image = imageId;
            return data;
        },
        getCreateId: (r) => r.createCompany?.id,
        getUpdateId: (r) => r.updateCompany?.id,
    });

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues} className="Publish__form">
            <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <MarkdownEditor rows={6} placeholder="Supports Markdown formatting" />
            </Form.Item>
            <ImageUploadField existingImageUrl={initialValues?.existingImageUrl} />
            <Form.Item name="identity" label="Identity" rules={[{ required: true, message: "Please select an identity" }]}>
                <Select
                    loading={identitiesQuery.isLoading}
                    placeholder="Select an identity"
                    options={identities.map((i) => ({ value: i.id, label: i.name }))}
                />
            </Form.Item>
            <Form.Item name="email" label="Email">
                <Input type="email" />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
                <Input />
            </Form.Item>
            <Form.Item name="website" label="Website">
                <Input />
            </Form.Item>
            <Form.Item>
                <FormSubmitButtons mode={mode} entityName="Company" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
