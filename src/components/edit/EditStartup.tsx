import * as React from "react";

import { useParams } from "react-router-dom";

import { Typography } from "antd";

import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { AuthGuard } from "../AuthGuard";
import { useStartupByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { OwnerGuard } from "../OwnerGuard";
import { StartupForm } from "../publish/StartupForm";

const EditStartup: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useStartupByIdQuery({ id: id!, draft: true });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const startup = data.Startup;
                        const createdById = (startup?.createdBy as { id?: string } | null)?.id;

                        return (
                            <OwnerGuard createdById={createdById}>
                                <DetailPageTracker serverUrl={startup?.serverURL ?? undefined} />
                                <Typography.Title level={3}>Edit Venture</Typography.Title>
                                <StartupForm
                                    mode="edit"
                                    initialValues={{
                                        id: startup?.id,
                                        title: startup?.title || "",
                                        description: startup?.description || "",
                                        company: startup?.company?.id,
                                        identity: startup?.identity?.id,
                                        stage: startup?.stage as never,
                                        lookingFor: startup?.lookingFor as never,
                                        alreadyHave: startup?.alreadyHave as never,
                                        fundsNeededAmount: startup?.fundsNeeded?.amount,
                                        fundsNeededCurrency: startup?.fundsNeeded?.currency,
                                        existingImageUrl: startup?.image?.url,
                                        existingImageId: startup?.image?.id,
                                    }}
                                    url={startup?.serverURL!}
                                />
                            </OwnerGuard>
                        );
                    }}
                </Loader>
            </div>
        </AuthGuard>
    );
};

export default EditStartup;
