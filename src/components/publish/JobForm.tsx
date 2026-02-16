import React from "react";
import { Button, DatePicker, Form, Input, InputNumber, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
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
import { resolveImageId } from "./useImageUpload";

const employmentOptions = [
    { value: Job_EmploymentType_MutationInput.FullTime, label: "Full-time" },
    { value: Job_EmploymentType_MutationInput.PartTime, label: "Part-time" },
    { value: Job_EmploymentType_MutationInput.Contract, label: "Contract" },
    { value: Job_EmploymentType_MutationInput.Internship, label: "Internship" },
    { value: Job_EmploymentType_MutationInput.Gig, label: "Gig" },
];

const commonCurrencies = ["USD", "EUR", "GBP", "LLD", "BTC", "ETH"].map((c) => ({
    value: c,
    label: c,
}));

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
    const navigate = useNavigate();
    const auth = useAuth();
    const [form] = Form.useForm();
    const createMutation = useCreateJobMutation();
    const updateMutation = useUpdateJobMutation();
    const loading = createMutation.isPending || updateMutation.isPending;

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

    const onFinish = async (values: JobFormValues) => {
        const imageId = await resolveImageId(values.imageFile, initialValues?.existingImageId);

        const data: Record<string, unknown> = {
            title: values.title,
            description: values.description,
            employmentType: values.employmentType,
            positions: values.positions,
            postedAt: values.postedAt.toISOString(),
            location: values.location || undefined,
            applyUrl: values.applyUrl || undefined,
            company: values.company || undefined,
        };

        if (imageId !== undefined) {
            data.image = imageId;
        }

        if (values.salaryMin != null || values.salaryMax != null) {
            data.salaryRange = {
                min: values.salaryMin,
                max: values.salaryMax,
                currency: values.salaryCurrency || "USD",
            };
        }

        if (values.bountyAmount != null) {
            data.bounty = {
                amount: values.bountyAmount,
                currency: values.bountyCurrency || "USD",
            };
        }

        try {
            if (mode === "edit" && initialValues?.id) {
                const result = await updateMutation.mutateAsync({
                    id: initialValues.id,
                    data: data as never,
                });
                message.success("Job updated");
                navigate(`/jobs/${result.updateJob?.id}`);
            } else {
                const result = await createMutation.mutateAsync({ data: data as never });
                message.success("Job published!");
                navigate(`/jobs/${result.createJob?.id}`);
            }
        } catch (e: unknown) {
            message.error(e instanceof Error ? e.message : "Something went wrong");
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={defaults} className="Publish__form">
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
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
                <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="postedAt" label="Posted Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
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
                        <InputNumber placeholder="Min" style={{ width: "35%" }} />
                    </Form.Item>
                    <Form.Item name="salaryMax" noStyle>
                        <InputNumber placeholder="Max" style={{ width: "35%" }} />
                    </Form.Item>
                    <Form.Item name="salaryCurrency" noStyle>
                        <Select placeholder="Currency" options={commonCurrencies} style={{ width: "30%" }} allowClear />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item label="Bounty">
                <Input.Group compact>
                    <Form.Item name="bountyAmount" noStyle>
                        <InputNumber placeholder="Amount" style={{ width: "70%" }} />
                    </Form.Item>
                    <Form.Item name="bountyCurrency" noStyle>
                        <Select placeholder="Currency" options={commonCurrencies} style={{ width: "30%" }} allowClear />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {mode === "edit" ? "Save changes" : "Publish Job"}
                </Button>
            </Form.Item>
        </Form>
    );
};
