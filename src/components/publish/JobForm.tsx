import * as React from "react";

import { useAuth } from "react-oidc-context";

import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";

import { Job_EmploymentType_MutationInput } from "../../generated/graphql";
import { useCreateJobMutation, useListCompaniesByCreatorQuery, useUpdateJobMutation } from "../hooks";

import { currencyOptions } from "./constants";
import { FormSubmitButtons } from "./FormSubmitButtons";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";
import { useEntityForm } from "./useEntityForm";

const employmentOptions = [
    {
        value: Job_EmploymentType_MutationInput.FullTime,
        label: "Full-time",
    },
    {
        value: Job_EmploymentType_MutationInput.PartTime,
        label: "Part-time",
    },
    {
        value: Job_EmploymentType_MutationInput.Contract,
        label: "Contract",
    },
    {
        value: Job_EmploymentType_MutationInput.Internship,
        label: "Internship",
    },
    {
        value: Job_EmploymentType_MutationInput.Gig,
        label: "Gig",
    },
];
interface JobFormValues {
    title: string | null;
    description?: string | null;
    employmentType: Job_EmploymentType_MutationInput | null;
    positions: number | null;
    postedAt: dayjs.Dayjs;
    location?: string | null;
    applyUrl?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string | null;
    bountyAmount?: number | null;
    bountyCurrency?: string | null;
    company?: string | null;
    imageFile?: UploadFile[];
}
export interface JobFormProps {
    mode: "create" | "edit";
    url: string;
    initialValues?: Partial<JobFormValues> & {
        id?: string | null;
        existingImageUrl?: string | null;
        existingImageId?: string | null;
    };
}
export const JobForm: React.FunctionComponent<JobFormProps> = (props) => {
    const auth = useAuth();
    const createMutation = useCreateJobMutation();
    const updateMutation = useUpdateJobMutation();
    const userId = auth.user?.profile?.sub;
    const companiesQuery = useListCompaniesByCreatorQuery({
        userId,
        draft: true,
        url: props.url,
    });
    const companies = companiesQuery.data?.Companies?.docs ?? [];
    const defaults: Partial<JobFormValues> = {
        ...props.initialValues,
        positions: typeof props.initialValues?.positions === "number" ? props.initialValues.positions : 1,
        postedAt: props.initialValues?.postedAt ? props.initialValues.postedAt : dayjs(),
        salaryCurrency: props.initialValues?.salaryCurrency ? props.initialValues.salaryCurrency : "USD",
        bountyCurrency: props.initialValues?.bountyCurrency ? props.initialValues.bountyCurrency : "USD",
    };
    const { form, draftRef, loading, onFinish } = useEntityForm({
        entityName: "Job",
        routePrefix: "/jobs",
        mode: props.mode,
        existingImageId: props.initialValues?.existingImageId,
        editId: props.initialValues?.id,
        createMutation,
        updateMutation,
        url: props.url,
        buildData: (values: JobFormValues, imageId) => ({
            title: values.title,
            description: values.description,
            employmentType: values.employmentType,
            positions: values.positions,
            postedAt: values.postedAt.toISOString(),
            location: values.location,
            applyUrl: values.applyUrl,
            company: values.company,
            ...(imageId !== undefined && {
                image: imageId,
            }),
            ...(typeof values.salaryMin === "number" || typeof values.salaryMax === "number"
                ? {
                      salaryRange: {
                          min: values.salaryMin,
                          max: values.salaryMax,
                          currency: values.salaryCurrency,
                      },
                  }
                : {}),
            ...(typeof values.bountyAmount === "number"
                ? {
                      bounty: {
                          amount: values.bountyAmount,
                          currency: values.bountyCurrency,
                      },
                  }
                : {}),
        }),
        getCreateId: (r) => r.createJob?.id,
        getUpdateId: (r) => r.updateJob?.id,
    });
    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={defaults} className="Publish__form">
            <Form.Item
                name="title"
                label="Title"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <MarkdownEditor rows={6} placeholder="Supports Markdown formatting" />
            </Form.Item>
            <ImageUploadField existingImageUrl={props.initialValues?.existingImageUrl} serverUrl={props.url} />
            <Form.Item
                name="employmentType"
                label="Employment Type"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select options={employmentOptions} />
            </Form.Item>
            {companies.length > 0 && (
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
                        placeholder="Select a company"
                        options={companies.map((c) => ({
                            value: c.id,
                            label: c.name,
                        }))}
                    />
                </Form.Item>
            )}
            <Form.Item
                name="positions"
                label="Positions"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <InputNumber min={1} className="Publish__fullWidth" />
            </Form.Item>
            <Form.Item
                name="postedAt"
                label="Posted Date"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
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
                        <Select
                            placeholder="Currency"
                            options={currencyOptions}
                            className="Publish__currencySelect"
                            allowClear
                        />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item label="Bounty">
                <Input.Group compact>
                    <Form.Item name="bountyAmount" noStyle>
                        <InputNumber placeholder="Amount" className="Publish__amountInput" />
                    </Form.Item>
                    <Form.Item name="bountyCurrency" noStyle>
                        <Select
                            placeholder="Currency"
                            options={currencyOptions}
                            className="Publish__currencySelect"
                            allowClear
                        />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item>
                <FormSubmitButtons mode={props.mode} entityName="Job" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
