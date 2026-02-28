import React from "react";
import {
    Form,
    Input,
    InputNumber,
    Select } from "antd";
import { useAuth } from "react-oidc-context";
import type { UploadFile } from "antd/es/upload/interface";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";
import { FormSubmitButtons } from "./FormSubmitButtons";
import { useEntityForm } from "./useEntityForm";
import { currencyOptions } from "./constants";
import {
    useCreateProductMutation,
    useListCompaniesByCreatorQuery,
    useUpdateProductMutation,
} from "../hooks";

interface ProductFormValues {
    name: string | null;
    description?: string | null;
    priceAmount?: number | null;
    priceCurrency: string | null;
    url?: string | null;
    inventory?: number | null;
    company?: string | null;
    imageFile?: UploadFile[];
}

export interface ProductFormProps {
    mode: "create" | "edit";
    url: string;
    initialValues?: Partial<ProductFormValues> & {
        id?: string | null;
        existingImageUrl?: string | null;
        existingImageId?: string | null;
    };
}

export const ProductForm: React.FunctionComponent<ProductFormProps> = ({ mode, initialValues, url }) => {
    const auth = useAuth();
    const createMutation = useCreateProductMutation();
    const updateMutation = useUpdateProductMutation();

    const userId = auth.user?.profile?.sub;
    const companiesQuery = useListCompaniesByCreatorQuery(
        { userId },
    );
    const companies = companiesQuery.data?.Companies?.docs ?? [];
    const defaults: Partial<ProductFormValues> = {
        ...initialValues,
        priceCurrency: initialValues?.priceCurrency ? initialValues.priceCurrency : "USD",
    };

    const { form, draftRef, loading, onFinish } = useEntityForm({
        entityName: "Product",
        routePrefix: "/products-services",
        mode,
        existingImageId: initialValues?.existingImageId,
        editId: initialValues?.id,
        createMutation,
        updateMutation,
        url,
        buildData: (values: ProductFormValues, imageId) => ({
            name: values.name,
            description: values.description,
            url: values.url,
            company: values.company,
            price: { amount: values.priceAmount, currency: values.priceCurrency },
            inventory: values.inventory,
            ...(imageId !== undefined && { image: imageId }),
        }),
        getCreateId: (r) => r.createProduct?.id,
        getUpdateId: (r) => r.updateProduct?.id,
    });

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={defaults} className="Publish__form">
            <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <MarkdownEditor rows={6} placeholder="Supports Markdown formatting" />
            </Form.Item>
            <ImageUploadField existingImageUrl={initialValues?.existingImageUrl} serverUrl={url} />
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
                <FormSubmitButtons mode={mode} entityName="Product" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
