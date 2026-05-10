import * as React from "react";

import { useParams } from "react-router-dom";

import { Typography } from "antd";

import { decodeServerUrlSegment } from "../../routes";
import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { AuthGuard } from "../AuthGuard";
import { useCompanyByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { OwnerGuard } from "../OwnerGuard";
import { CompanyForm } from "../publish/CompanyForm";

const EditCompany: React.FunctionComponent = () => {
    const { id, serverUrl } = useParams<{ id: string; serverUrl: string }>();
    const routeServerURL = decodeServerUrlSegment(serverUrl ?? "");
    const query = useCompanyByIdQuery({ id: id!, draft: true, url: routeServerURL });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const company = data.Company;
                        const createdById = company?.createdBy?.id;

                        return (
                            <OwnerGuard createdById={createdById}>
                                <DetailPageTracker serverUrl={company?.serverURL ?? routeServerURL} />
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
                                    url={company?.serverURL ?? routeServerURL}
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
