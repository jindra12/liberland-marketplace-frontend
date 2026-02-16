import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { Result, Spin, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import { useCompanyByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { CompanyForm } from "../publish/CompanyForm";

const EditCompany: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const auth = useAuth();
    const query = useCompanyByIdQuery({ id: id! });

    if (auth.isLoading) return <Spin />;
    if (!auth.isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="Publish">
            <Loader query={query}>
                {(data) => {
                    const company = data.Company;
                    const createdById = (company?.createdBy as { id?: string } | null)?.id;
                    if (createdById && createdById !== auth.user?.profile?.sub) {
                        return <Result status="403" title="Not authorized" subTitle="You can only edit your own listings." />;
                    }

                    const initialValues = {
                        id: company?.id,
                        name: company?.name || "",
                        description: company?.description || "",
                        email: company?.email || "",
                        phone: company?.phone || "",
                        website: company?.website || "",
                        identity: company?.identity?.id || undefined,
                        existingImageUrl: company?.image?.url || undefined,
                        existingImageId: company?.image?.id || undefined,
                    };

                    return (
                        <>
                            <Typography.Title level={3}>Edit Company</Typography.Title>
                            <CompanyForm mode="edit" initialValues={initialValues} />
                        </>
                    );
                }}
            </Loader>
        </div>
    );
};

export default EditCompany;
