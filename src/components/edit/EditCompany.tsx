import React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useCompanyByIdQuery } from "../../generated/graphql";
import { AuthGuard } from "../AuthGuard";
import { OwnerGuard } from "../OwnerGuard";
import { Loader } from "../Loader";
import { CompanyForm } from "../publish/CompanyForm";

const EditCompany: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useCompanyByIdQuery({ id: id! });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const company = data.Company;
                        const createdById = (company?.createdBy as { id?: string } | null)?.id;

                        return (
                            <OwnerGuard createdById={createdById}>
                                <Typography.Title level={3}>Edit Company</Typography.Title>
                                <CompanyForm
                                    mode="edit"
                                    initialValues={{
                                        id: company?.id,
                                        name: company?.name || "",
                                        description: company?.description || "",
                                        email: company?.email || "",
                                        phone: company?.phone || "",
                                        website: company?.website || "",
                                        identity: company?.identity?.id,
                                        existingImageUrl: company?.image?.url,
                                        existingImageId: company?.image?.id,
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

export default EditCompany;
