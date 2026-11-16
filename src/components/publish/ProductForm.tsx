import * as React from "react";

import { DollarOutlined } from "@ant-design/icons";
import { Checkbox, Form, Input, InputNumber } from "antd";
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
import { FormNavigationGuard } from "./FormNavigationGuard";
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
    orderable?: boolean | null;
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
    const createMutation = useCreateProductMutation();
    const updateMutation = useUpdateProductMutation();
    const defaults: Partial<ProductFormValues> = {
        ...props.initialValues,
        orderable: props.initialValues?.orderable ?? true,
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
            const parameters = buildProductParametersInput(values.parameters);

            return {
                name: values.name,
                description: values.description,
                url: values.url,
                company: values.company,
                cryptoAddresses: buildCryptoAddressesInput(values.cryptoAddresses),
                ...(parameters !== undefined && {
                    parameters,
                }),
                priceInUSDEnabled: true,
                priceInUSD: values.priceInUSD ? toCents(Number(values.priceInUSD)) : null,
                inventory: values.inventory,
                orderable: values.orderable,
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
            <FormNavigationGuard />
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
            <Form.Item
                name="url"
                label="Product URL"
                rules={[buildMaxLengthRule(TEXT_INPUT_MAX_LENGTH)]}
                className="Publish__productUrlField"
            >
                <Input />
            </Form.Item>
            <Form.Item name="inventory" label="Inventory" className="Publish__productInventoryField">
                <InputNumber min={0} className="Publish__fullWidth" />
            </Form.Item>
            <Form.Item
                name="orderable"
                valuePropName="checked"
                extra="Allow customers to buy this product directly on Nswap. A payout wallet must be set on the product or its company."
                className="Publish__productOrderableField"
            >
                <Checkbox>Allow purchases on Nswap</Checkbox>
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
                <CompanyField serverURL={props.url} />
            </Form.Item>
            <ProductParametersField />
            <CryptoAddressesField description="Optional single payout wallet. If no product wallet is set, the company wallet is used at checkout." />
            <Form.Item>
                <FormSubmitButtons mode={props.mode} entityName="Product" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
