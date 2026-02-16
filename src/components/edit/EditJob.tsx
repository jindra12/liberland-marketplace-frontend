import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { Result, Spin, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import dayjs from "dayjs";
import { useJobByIdQuery, Job_EmploymentType_MutationInput } from "../../generated/graphql";
import { Loader } from "../Loader";
import { JobForm } from "../publish/JobForm";

const EditJob: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const auth = useAuth();
    const query = useJobByIdQuery({ id: id! });

    if (auth.isLoading) return <Spin />;
    if (!auth.isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="Publish">
            <Loader query={query}>
                {(data) => {
                    const job = data.Job;
                    const createdById = (job?.createdBy as { id?: string } | null)?.id;
                    if (createdById && createdById !== auth.user?.profile?.sub) {
                        return <Result status="403" title="Not authorized" subTitle="You can only edit your own listings." />;
                    }

                    const initialValues = {
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
                        salaryCurrency: job?.salaryRange?.currency || undefined,
                        bountyAmount: job?.bounty?.amount ?? undefined,
                        bountyCurrency: job?.bounty?.currency || undefined,
                        existingImageUrl: job?.image?.url || undefined,
                        existingImageId: job?.image?.id || undefined,
                    };

                    return (
                        <>
                            <Typography.Title level={3}>Edit Job</Typography.Title>
                            <JobForm mode="edit" initialValues={initialValues} />
                        </>
                    );
                }}
            </Loader>
        </div>
    );
};

export default EditJob;
