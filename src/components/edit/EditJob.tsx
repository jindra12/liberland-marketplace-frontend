import React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import dayjs from "dayjs";
import { Job_EmploymentType_MutationInput } from "../../generated/graphql";
import { AuthGuard } from "../AuthGuard";
import { OwnerGuard } from "../OwnerGuard";
import { Loader } from "../Loader";
import { JobForm } from "../publish/JobForm";
import { useJobByIdQuery } from "../hooks";
import { DetailPageTracker } from "../analytics/DetailPageTracker";

const EditJob: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useJobByIdQuery({ id: id!, draft: true });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const job = data.Job;
                        const createdById = job?.createdBy?.id;

                        return (
                            <OwnerGuard createdById={createdById}>
                                <DetailPageTracker serverUrl={job?.serverURL ?? undefined} />
                                <Typography.Title level={3}>Edit Job</Typography.Title>
                                <JobForm
                                    mode="edit"
                                    initialValues={{
                                        id: job?.id,
                                        title: job?.title,
                                        description: job?.description,
                                        employmentType: job?.employmentType as unknown as Job_EmploymentType_MutationInput,
                                        positions: job?.positions,
                                        postedAt: job?.postedAt ? dayjs(job.postedAt) : dayjs(),
                                        location: job?.location,
                                        applyUrl: job?.applyUrl,
                                        salaryMin: job?.salaryRange?.min,
                                        salaryMax: job?.salaryRange?.max,
                                        salaryCurrency: job?.salaryRange?.currency,
                                        bountyAmount: job?.bounty?.amount,
                                        bountyCurrency: job?.bounty?.currency,
                                        company: job?.company?.id,
                                        existingImageUrl: job?.image?.url,
                                        existingImageId: job?.image?.id,
                                    }}
                                    url={job?.serverURL!}
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
