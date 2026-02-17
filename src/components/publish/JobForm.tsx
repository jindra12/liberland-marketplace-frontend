import React from "react";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import { useAuth } from "react-oidc-context";
import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";
import {
    Job_EmploymentType_MutationInput,
    useCreateJobMutation,
    useUpdateJobMutation,
    useListCompaniesByCreatorQuery,
} from "../../generated/graphql";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";
import { FormSubmitButtons } from "./FormSubmitButtons";
import { useEntityForm } from "./useEntityForm";
import { stripEmpty } from "./formUtils";
import { currencyOptions } from "./constants";

const employmentOptions = [
    { value: Job_EmploymentType_MutationInput.FullTime, label: "Full-time" },
    { value: Job_EmploymentType_MutationInput.PartTime, label: "Part-time" },
    { value: Job_EmploymentType_MutationInput.Contract, label: "Contract" },
    { value: Job_EmploymentType_MutationInput.Internship, label: "Internship" },
    { value: Job_EmploymentType_MutationInput.Gig, label: "Gig" },
];

interface JobFormValues {
    title: string;
    description?: string;
    employmentType: Job_EmploymentType_MutationInput;
    positions: number;
    postedAt: dayjs.Dayjs;
    location?: string;
    applyUrl?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    bountyAmount?: number;
    bountyCurrency?: string;
    company?: string;
    imageFile?: UploadFile[];
}

export interface JobFormProps {
    mode: "create" | "edit";
    initialValues?: Partial<JobFormValues> & {
        id?: string;
        existingImageUrl?: string;
        existingImageId?: string;
    };
}

export const JobForm: React.FunctionComponent<JobFormProps> = ({ mode, initialValues }) => {
    const auth = useAuth();
    const createMutation = useCreateJobMutation();
    const updateMutation = useUpdateJobMutation();

    const userId = auth.user?.profile?.sub;
    const companiesQuery = useListCompaniesByCreatorQuery(
        { userId },
        { enabled: !!userId },
    );
    const companies = companiesQuery.data?.Companies?.docs ?? [];

    const defaults: Partial<JobFormValues> = {
        positions: 1,
        postedAt: dayjs(),
        ...initialValues,
    };

    const { form, draftRef, loading, onFinish } = useEntityForm({
        entityName: "Job",
        routePrefix: "/jobs",
        mode,
        existingImageId: initialValues?.existingImageId,
        editId: initialValues?.id,
        createMutation,
        updateMutation,
        buildData: (values: JobFormValues, imageId) => ({
            ...stripEmpty({
                title: values.title,
                description: values.description ?? "",
                employmentType: values.employmentType,
                positions: values.positions,
                postedAt: values.postedAt.toISOString(),
                location: values.location ?? "",
                applyUrl: values.applyUrl ?? "",
                company: values.company ?? "",
            }),
            ...(imageId !== undefined && { image: imageId }),
            ...(typeof values.salaryMin === "number" || typeof values.salaryMax === "number"
                ? { salaryRange: { min: values.salaryMin, max: values.salaryMax, currency: values.salaryCurrency || "USD" } }
                : {}),
            ...(typeof values.bountyAmount === "number"
                ? { bounty: { amount: values.bountyAmount, currency: values.bountyCurrency || "USD" } }
                : {}),
        }),
        getCreateId: (r) => r.createJob?.id,
        getUpdateId: (r) => r.updateJob?.id,
    });

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={defaults} className="Publish__form">
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <MarkdownEditor rows={6} placeholder="Supports Markdown formatting" />
            </Form.Item>
            <ImageUploadField existingImageUrl={initialValues?.existingImageUrl} />
            <Form.Item name="employmentType" label="Employment Type" rules={[{ required: true }]}>
                <Select options={employmentOptions} />
            </Form.Item>
            {companies.length > 0 && (
                <Form.Item name="company" label="Company" rules={[{ required: true, message: "Please select a company" }]}>
                    <Select
                        placeholder="Select a company"
                        options={companies.map((c) => ({ value: c.id, label: c.name }))}
                    />
                </Form.Item>
            )}
            <Form.Item name="positions" label="Positions" rules={[{ required: true }]}>
                <InputNumber min={1} className="Publish__fullWidth" />
            </Form.Item>
            <Form.Item name="postedAt" label="Posted Date" rules={[{ required: true }]}>
                <DatePicker className="Publish__fullWidth" />
            </Form.Item>
            <Form.Item name="location" label="Location">
                <Input />
            </Form.Item>
            <Form.Item name="applyUrl" label="Apply URL">
                <Input />
            </Form.Item>

            <Form.Item label="Salary Range">
                <Input.Group compact>
                    <Form.Item name="salaryMin" noStyle>
                        <InputNumber placeholder="Min" className="Publish__salaryMin" />
                    </Form.Item>
                    <Form.Item name="salaryMax" noStyle>
                        <InputNumber placeholder="Max" className="Publish__salaryMax" />
                    </Form.Item>
                    <Form.Item name="salaryCurrency" noStyle>
                        <Select placeholder="Currency" options={currencyOptions} className="Publish__currencySelect" allowClear />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item label="Bounty">
                <Input.Group compact>
                    <Form.Item name="bountyAmount" noStyle>
                        <InputNumber placeholder="Amount" className="Publish__amountInput" />
                    </Form.Item>
                    <Form.Item name="bountyCurrency" noStyle>
                        <Select placeholder="Currency" options={currencyOptions} className="Publish__currencySelect" allowClear />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item>
                <FormSubmitButtons mode={mode} entityName="Job" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
