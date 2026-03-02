import React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useStartupByIdQuery } from "../../generated/graphql";
import { AuthGuard } from "../AuthGuard";
import { OwnerGuard } from "../OwnerGuard";
import { Loader } from "../Loader";
import { VentureForm } from "../publish/VentureForm";

const EditVenture: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const query = useStartupByIdQuery({ id: id! });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const venture = data.Startup;
                        const createdById = (venture?.createdBy as { id?: string } | null)?.id;

                        return (
                            <OwnerGuard createdById={createdById}>
                                <Typography.Title level={3}>Edit Venture</Typography.Title>
                                <VentureForm
                                    mode="edit"
                                    initialValues={{
                                        id: venture?.id,
                                        title: venture?.title || "",
                                        description: venture?.description || "",
                                        company: venture?.company?.id,
                                        identity: venture?.identity?.id,
                                        stage: venture?.stage as never,
                                        lookingFor: venture?.lookingFor as never,
                                        alreadyHave: venture?.alreadyHave as never,
                                        fundsNeededAmount: venture?.fundsNeeded?.amount,
                                        fundsNeededCurrency: venture?.fundsNeeded?.currency,
                                        existingImageUrl: venture?.image?.url,
                                        existingImageId: venture?.image?.id,
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

export default EditVenture;
