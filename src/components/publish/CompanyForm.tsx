import React, { useRef } from "react";
import { Button, Form, Input, message, Select, Space } from "antd";
import { useNavigate } from "react-router-dom";
import type { UploadFile } from "antd/es/upload/interface";
import {
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useListIdentitiesQuery,
} from "../../generated/graphql";
import { ImageUploadField } from "./ImageUploadField";
import { resolveImageId } from "./useImageUpload";

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
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const createMutation = useCreateCompanyMutation();
    const updateMutation = useUpdateCompanyMutation();
    const loading = createMutation.isPending || updateMutation.isPending;
    const draftRef = useRef(false);

    const identitiesQuery = useListIdentitiesQuery({ limit: 100 });
    const identities = identitiesQuery.data?.Identities?.docs ?? [];

    const onFinish = async (values: CompanyFormValues) => {
        const imageId = await resolveImageId(values.imageFile, initialValues?.existingImageId);

        const data: Record<string, unknown> = {
            name: values.name,
            description: values.description || undefined,
            email: values.email || undefined,
            phone: values.phone || undefined,
            website: values.website || undefined,
            identity: values.identity || undefined,
        };

        if (imageId !== undefined) {
            data.image = imageId;
        }

        try {
            const draft = draftRef.current;
            if (mode === "edit" && initialValues?.id) {
                const result = await updateMutation.mutateAsync({
                    id: initialValues.id,
                    data: data as never,
                    draft,
                });
                message.success(draft ? "Company saved as draft" : "Company published!");
                navigate(`/companies/${result.updateCompany?.id}`);
            } else {
                const result = await createMutation.mutateAsync({ data: data as never, draft });
                message.success(draft ? "Company saved as draft" : "Company published!");
                navigate(`/companies/${result.createCompany?.id}`);
            }
        } catch (e: unknown) {
            message.error(e instanceof Error ? e.message : "Something went wrong");
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues} className="Publish__form">
            <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
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
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} onClick={() => { draftRef.current = false; }}>
                        {mode === "edit" ? "Publish" : "Publish Company"}
                    </Button>
                    <Button htmlType="submit" loading={loading} onClick={() => { draftRef.current = true; }}>
                        Save as Draft
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};
