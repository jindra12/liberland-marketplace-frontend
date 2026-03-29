import React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";

import { AuthGuard } from "../AuthGuard";
import { OwnerGuard } from "../OwnerGuard";
import { Loader } from "../Loader";
import { CompanyForm } from "../publish/CompanyForm";
import { useCompanyByIdQuery } from "../hooks";
import { DetailPageTracker } from "../analytics/DetailPageTracker";

const EditCompany: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useCompanyByIdQuery({ id: id!, draft: true });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const company = data.Company;
                        const createdById = company?.createdBy?.id;

                        return (
                            <OwnerGuard createdById={createdById}>
                                <DetailPageTracker serverUrl={company?.serverURL ?? undefined} />
                                <Typography.Title level={3}>Edit Company</Typography.Title>
                                <CompanyForm
                                    mode="edit"
                                    initialValues={{
                                        id: company?.id,
                                        name: company?.name,
                                        description: company?.description,
                                        email: company?.email,
                                        phone: company?.phone,
                                        website: company?.website,
                                        identity: company?.identity?.id,
                                        existingImageUrl: company?.image?.url,
                                        existingImageId: company?.image?.id,
                                    }}
                                    url={company?.serverURL!}
                                />
                            </OwnerGuard>
                        );
                    }}
                </Loader>
            </div>
        </AuthGuard>
    );
};

export default EditCompany;
