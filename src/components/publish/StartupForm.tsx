import React from "react";
import { Form, Input, InputNumber, Select } from "antd";
import { useAuth } from "react-oidc-context";
import type { UploadFile } from "antd/es/upload/interface";
import {
    Startup_Stage_MutationInput,
    Startup_LookingFor_MutationInput,
    Startup_AlreadyHave_MutationInput,
    useCreateStartupMutation,
    useUpdateStartupMutation,
    useListCompaniesByCreatorQuery,
    useListIdentitiesQuery,
} from "../../generated/graphql";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";
import { FormSubmitButtons } from "./FormSubmitButtons";
import { useEntityForm } from "./useEntityForm";
import { currencyOptions } from "./constants";

const stageOptions = [
    { value: Startup_Stage_MutationInput.Idea, label: "Idea" },
    { value: Startup_Stage_MutationInput.Early, label: "Early" },
    { value: Startup_Stage_MutationInput.Mvp, label: "MVP" },
    { value: Startup_Stage_MutationInput.Established, label: "Established" },
    { value: Startup_Stage_MutationInput.Scaling, label: "Scaling" },
];

const resourceOptions = [
    { value: Startup_LookingFor_MutationInput.Funding, label: "Funding" },
    { value: Startup_LookingFor_MutationInput.Founders, label: "Founders" },
    { value: Startup_LookingFor_MutationInput.Team, label: "Team" },
    { value: Startup_LookingFor_MutationInput.Traction, label: "Traction" },
    { value: Startup_LookingFor_MutationInput.Distribution, label: "Distribution" },
    { value: Startup_LookingFor_MutationInput.Production, label: "Production" },
    { value: Startup_LookingFor_MutationInput.Idea, label: "Idea" },
    { value: Startup_LookingFor_MutationInput.Product, label: "Product" },
];

const alreadyHaveOptions = [
    { value: Startup_AlreadyHave_MutationInput.Funding, label: "Funding" },
    { value: Startup_AlreadyHave_MutationInput.Founders, label: "Founders" },
    { value: Startup_AlreadyHave_MutationInput.Team, label: "Team" },
    { value: Startup_AlreadyHave_MutationInput.Traction, label: "Traction" },
    { value: Startup_AlreadyHave_MutationInput.Distribution, label: "Distribution" },
    { value: Startup_AlreadyHave_MutationInput.Production, label: "Production" },
    { value: Startup_AlreadyHave_MutationInput.Idea, label: "Idea" },
    { value: Startup_AlreadyHave_MutationInput.Product, label: "Product" },
];

interface StartupFormValues {
    title: string;
    description?: string;
    company?: string;
    identity?: string;
    stage: Startup_Stage_MutationInput;
    lookingFor?: Startup_LookingFor_MutationInput[];
    alreadyHave?: Startup_AlreadyHave_MutationInput[];
    fundsNeededAmount?: number | null;
    fundsNeededCurrency?: string | null;
    imageFile?: UploadFile[];
}

export interface StartupFormProps {
    mode: "create" | "edit";
    initialValues?: Partial<StartupFormValues> & {
        id?: string;
        existingImageUrl?: string | null;
        existingImageId?: string | null;
    };
}

export const StartupForm: React.FunctionComponent<StartupFormProps> = ({ mode, initialValues }) => {
    const auth = useAuth();
    const createMutation = useCreateStartupMutation();
    const updateMutation = useUpdateStartupMutation();

    const userId = auth.user?.profile?.sub;
    const companiesQuery = useListCompaniesByCreatorQuery(
        { userId },
        { enabled: !!userId },
    );
    const companies = companiesQuery.data?.Companies?.docs ?? [];

    const identitiesQuery = useListIdentitiesQuery({ limit: 100 });
    const identities = identitiesQuery.data?.Identities?.docs ?? [];

    const defaults: Partial<StartupFormValues> = {
        stage: Startup_Stage_MutationInput.Idea,
        ...initialValues,
    };

    const { form, draftRef, loading, onFinish } = useEntityForm({
        entityName: "Startup",
        routePrefix: "/startups",
        mode,
        existingImageId: initialValues?.existingImageId,
        editId: initialValues?.id,
        createMutation,
        updateMutation,
        buildData: (values: StartupFormValues, imageId) => ({
            title: values.title,
            description: values.description,
            company: values.company,
            identity: values.identity,
            stage: values.stage,
            ...(values.lookingFor?.length ? { lookingFor: values.lookingFor } : {}),
            ...(values.alreadyHave?.length ? { alreadyHave: values.alreadyHave } : {}),
            ...(imageId !== undefined && { image: imageId }),
            ...(typeof values.fundsNeededAmount === "number"
                ? { fundsNeeded: { amount: values.fundsNeededAmount, currency: values.fundsNeededCurrency || "USD" } }
                : {}),
        }),
        getCreateId: (r) => r.createStartup?.id,
        getUpdateId: (r) => r.updateStartup?.id,
    });

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={defaults} className="Publish__form">
            <Form.Item name="title" label="Startup Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <MarkdownEditor rows={6} placeholder="Describe your startup (supports Markdown)" />
            </Form.Item>
            <ImageUploadField existingImageUrl={initialValues?.existingImageUrl} />
            <Form.Item name="company" label="Company" rules={[{ required: true, message: "Please select a company" }]}>
                <Select
                    loading={companiesQuery.isLoading}
                    placeholder="Select a company"
                    options={companies.map((c) => ({ value: c.id, label: c.name }))}
                />
            </Form.Item>
            <Form.Item name="identity" label="Tribe" rules={[{ required: true, message: "Please select a tribe" }]}>
                <Select
                    loading={identitiesQuery.isLoading}
                    placeholder="Select a tribe"
                    options={identities.map((i) => ({ value: i.id, label: i.name }))}
                />
            </Form.Item>
            <Form.Item name="stage" label="Stage" rules={[{ required: true }]}>
                <Select options={stageOptions} />
            </Form.Item>
            <Form.Item name="lookingFor" label="Looking For">
                <Select
                    mode="multiple"
                    placeholder="Select resources you need"
                    options={resourceOptions}
                    allowClear
                />
            </Form.Item>
            <Form.Item name="alreadyHave" label="Already Have">
                <Select
                    mode="multiple"
                    placeholder="Select resources you already have"
                    options={alreadyHaveOptions}
                    allowClear
                />
            </Form.Item>

            <Form.Item label="Funds Needed">
                <Input.Group compact>
                    <Form.Item name="fundsNeededAmount" noStyle>
                        <InputNumber placeholder="Amount" className="Publish__amountInput" />
                    </Form.Item>
                    <Form.Item name="fundsNeededCurrency" noStyle>
                        <Select placeholder="Currency" options={currencyOptions} className="Publish__currencySelect" allowClear />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item>
                <FormSubmitButtons mode={mode} entityName="Startup" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
