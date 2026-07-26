import * as React from "react";

import { useAuth } from "react-oidc-context";

import { DollarOutlined } from "@ant-design/icons";
import { Form, Input, InputNumber } from "antd";
import type { UploadFile } from "antd/es/upload/interface";

import { CompanyField } from "../CompanyField";
import { LONG_TEXT_INPUT_MAX_LENGTH, TEXT_INPUT_MAX_LENGTH, buildMaxLengthRule } from "../form/constants";
import { useCreateProductMutation, useUpdateProductMutation } from "../hooks";
import { ProductParametersField } from "../productParameters/ProductParametersField";
import type { ProductParameterDraft } from "../productParameters/types";
import { buildProductParametersInput } from "../productParameters/utils";
import { toCents } from "../shared/product/utils";

import { CryptoAddressesField } from "./CryptoAddressesField/CryptoAddressesField";
import type { CryptoAddressesFormValue } from "./CryptoAddressesField/types";
import { buildCryptoAddressesInput } from "./CryptoAddressesField/utils";
import { FormSubmitButtons } from "./FormSubmitButtons";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";
import { useEntityForm } from "./useEntityForm";

interface ProductFormValues {
    name: string | null;
    description?: string | null;
    priceInUSD?: string | number | null;
    url?: string | null;
    inventory?: number | null;
    company?: string | null;
    cryptoAddresses?: CryptoAddressesFormValue | null;
    parameters?: ProductParameterDraft[] | null;
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
export const ProductForm: React.FunctionComponent<ProductFormProps> = (props) => {
    const auth = useAuth();
    const createMutation = useCreateProductMutation();
    const updateMutation = useUpdateProductMutation();
    const userId = auth.user?.profile?.sub;
    const defaults: Partial<ProductFormValues> = {
        ...props.initialValues,
    };
    const { form, draftRef, loading, onFinish } = useEntityForm({
        entityName: "Product",
        routePrefix: "/products-services",
        mode: props.mode,
        existingImageId: props.initialValues?.existingImageId,
        editId: props.initialValues?.id,
        createMutation,
        updateMutation,
        url: props.url,
        buildData: (values: ProductFormValues, imageId) => {
            const cryptoAddresses = buildCryptoAddressesInput(values.cryptoAddresses);
            const parameters = buildProductParametersInput(values.parameters);

            return {
                name: values.name,
                description: values.description,
                url: values.url,
                company: values.company,
                ...(cryptoAddresses !== undefined && {
                    cryptoAddresses,
                }),
                ...(parameters !== undefined && {
                    parameters,
                }),
                priceInUSDEnabled: true,
                priceInUSD: values.priceInUSD ? toCents(Number(values.priceInUSD)) : null,
                inventory: values.inventory,
                ...(imageId !== undefined && {
                    image: imageId,
                }),
            };
        },
        getCreateId: (r) => r.createProduct?.id,
        getUpdateId: (r) => r.updateProduct?.id,
    });
    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={defaults} className="Publish__form">
            <Form.Item
                name="name"
                label="Product Name"
                rules={[
                    {
                        required: true,
                    },
                    buildMaxLengthRule(TEXT_INPUT_MAX_LENGTH),
                ]}
                className="Publish__productNameField"
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="description"
                label="Description"
                rules={[buildMaxLengthRule(LONG_TEXT_INPUT_MAX_LENGTH)]}
                className="Publish__productDescriptionField"
            >
                <MarkdownEditor rows={6} placeholder="Supports Markdown formatting" />
            </Form.Item>
            <ImageUploadField existingImageUrl={props.initialValues?.existingImageUrl} serverUrl={props.url} />
            <Form.Item
                name="priceInUSD"
                label="Price (USD)"
                rules={[
                    {
                        required: true,
                        message: "Enter USD price",
                    },
                ]}
                className="Publish__productPriceField"
            >
                <Input
                    suffix={<DollarOutlined />}
                    placeholder="USD amount"
                    inputMode="decimal"
                    className="Publish__fullWidth Publish__priceField"
                />
            </Form.Item>
            <Form.Item name="url" label="Product URL" rules={[buildMaxLengthRule(TEXT_INPUT_MAX_LENGTH)]} className="Publish__productUrlField">
                <Input />
            </Form.Item>
            <Form.Item name="inventory" label="Inventory" className="Publish__productInventoryField">
                <InputNumber min={0} className="Publish__fullWidth" />
            </Form.Item>
            <Form.Item
                name="company"
                label="Company"
                rules={[
                    {
                        required: true,
                    },
                ]}
                className="Publish__productCompanyField"
            >
                <CompanyField serverURL={props.url} userId={userId} />
            </Form.Item>
            <ProductParametersField />
            <CryptoAddressesField
                description="Optional single payout wallet. If no product wallet is set, the company wallet is used at checkout."
            />
            <Form.Item>
                <FormSubmitButtons mode={props.mode} entityName="Product" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
