import React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import dayjs from "dayjs";
import { useJobByIdQuery, Job_EmploymentType_MutationInput } from "../../generated/graphql";
import { AuthGuard } from "../AuthGuard";
import { OwnerGuard } from "../OwnerGuard";
import { Loader } from "../Loader";
import { JobForm } from "../publish/JobForm";

const EditJob: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useJobByIdQuery({ id: id! });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const job = data.Job;
                        const createdById = (job?.createdBy as { id?: string } | null)?.id;

                        return (
                            <OwnerGuard createdById={createdById}>
                                <Typography.Title level={3}>Edit Job</Typography.Title>
                                <JobForm
                                    mode="edit"
                                    initialValues={{
                                        id: job?.id,
                                        title: job?.title || "",
                                        description: job?.description || "",
                                        employmentType: job?.employmentType as unknown as Job_EmploymentType_MutationInput,
                                        positions: job?.positions || 1,
                                        postedAt: job?.postedAt ? dayjs(job.postedAt) : dayjs(),
                                        location: job?.location || "",
                                        applyUrl: job?.applyUrl || "",
                                        salaryMin: job?.salaryRange?.min ?? undefined,
                                        salaryMax: job?.salaryRange?.max ?? undefined,
                                        salaryCurrency: job?.salaryRange?.currency ?? undefined,
                                        bountyAmount: job?.bounty?.amount ?? undefined,
                                        bountyCurrency: job?.bounty?.currency ?? undefined,
                                        existingImageUrl: job?.image?.url ?? undefined,
                                        existingImageId: job?.image?.id ?? undefined,
                                    }}
                                />
                            </OwnerGuard>
                        );
                    }}
                </Loader>
            </div>
        </AuthGuard>
    );
};

export default EditJob;
