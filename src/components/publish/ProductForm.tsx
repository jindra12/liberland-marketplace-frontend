import React, { useRef } from "react";
import { Button, Form, Input, InputNumber, message, Select, Space } from "antd";
import { useNavigate } from "react-router-dom";
import type { UploadFile } from "antd/es/upload/interface";
import {
    useCreateProductMutation,
    useUpdateProductMutation,
    useListCompaniesByCreatorQuery,
} from "../../generated/graphql";
import { useAuth } from "react-oidc-context";
import { ImageUploadField } from "./ImageUploadField";
import { resolveImageId } from "./useImageUpload";
import { MarkdownEditor } from "./MarkdownEditor";
import { currencyOptions } from "./constants";

interface ProductFormValues {
    name: string;
    description?: string;
    priceAmount: number;
    priceCurrency: string;
    url?: string;
    inventory?: number;
    company?: string;
    imageFile?: UploadFile[];
}

export interface ProductFormProps {
    mode: "create" | "edit";
    initialValues?: Partial<ProductFormValues> & {
        id?: string;
        existingImageUrl?: string;
        existingImageId?: string;
    };
}

export const ProductForm: React.FunctionComponent<ProductFormProps> = ({ mode, initialValues }) => {
    const navigate = useNavigate();
    const auth = useAuth();
    const [form] = Form.useForm();
    const createMutation = useCreateProductMutation();
    const updateMutation = useUpdateProductMutation();
    const loading = createMutation.isPending || updateMutation.isPending;
    const draftRef = useRef(false);

    const userId = auth.user?.profile?.sub;
    const companiesQuery = useListCompaniesByCreatorQuery(
        { userId },
        { enabled: !!userId },
    );
    const companies = companiesQuery.data?.Companies?.docs ?? [];

    const onFinish = async (values: ProductFormValues) => {
        const imageId = await resolveImageId(values.imageFile, initialValues?.existingImageId);

        const data: Record<string, unknown> = {
            name: values.name,
            description: values.description || undefined,
            price: {
                amount: values.priceAmount,
                currency: values.priceCurrency,
            },
            url: values.url || undefined,
            inventory: values.inventory,
            company: values.company || undefined,
        };

        if (imageId !== undefined) {
            data.image = imageId;
        }

        try {
            const draft = draftRef.current;
            data._status = draft ? "draft" : "published";
            if (mode === "edit" && initialValues?.id) {
                const result = await updateMutation.mutateAsync({
                    id: initialValues.id,
                    data: data as never,
                    draft,
                });
                message.success(draft ? "Product saved as draft" : "Product published!");
                navigate(`/products-services/${result.updateProduct?.id}`);
            } else {
                const result = await createMutation.mutateAsync({ data: data as never, draft });
                message.success(draft ? "Product saved as draft" : "Product published!");
                navigate(`/products-services/${result.createProduct?.id}`);
            }
        } catch (e: unknown) {
            message.error(e instanceof Error ? e.message : "Something went wrong");
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues} className="Publish__form">
            <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <MarkdownEditor rows={6} placeholder="Supports Markdown formatting" />
            </Form.Item>
            <ImageUploadField existingImageUrl={initialValues?.existingImageUrl} />
            <Form.Item label="Price" required>
                <Input.Group compact>
                    <Form.Item name="priceAmount" noStyle rules={[{ required: true, message: "Enter price" }]}>
                        <InputNumber placeholder="Amount" min={0} className="Publish__amountInput" />
                    </Form.Item>
                    <Form.Item name="priceCurrency" noStyle rules={[{ required: true, message: "Select currency" }]}>
                        <Select placeholder="Currency" options={currencyOptions} className="Publish__currencySelect" />
                    </Form.Item>
                </Input.Group>
            </Form.Item>
            <Form.Item name="url" label="Product URL">
                <Input />
            </Form.Item>
            <Form.Item name="inventory" label="Inventory">
                <InputNumber min={0} className="Publish__fullWidth" />
            </Form.Item>
            <Form.Item name="company" label="Company" rules={[{ required: true }]}>
                <Select
                    placeholder="Select a company"
                    options={companies.map((c) => ({ value: c.id, label: c.name }))}
                />
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} onClick={() => { draftRef.current = false; }}>
                        {mode === "edit" ? "Publish" : "Publish Product"}
                    </Button>
                    <Button htmlType="submit" loading={loading} onClick={() => { draftRef.current = true; }}>
                        Save as Draft
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};
