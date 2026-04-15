import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useParams } from "react-router-dom";

import { EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Divider, Flex, Grid, Space, Typography } from "antd";

import { Comment_ReplyPostRelationshipInputRelationTo } from "../../generated/graphql";
import { ApplyButton } from "../ApplyButton";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { useJobByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { RouteButton } from "../RouteButton";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";
import { formatEmploymentType, formatSalary } from "../shared/job/utils";
import { getJobIdentityAccess, getJobMeta } from "../shared/jobDerived";
import { JobDetailsSummary } from "../shared/JobDetailsSummary";

import { CommonDetail } from "./CommonDetail";
import { IdentityGroups } from "./IdentityGroups";

const JobDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { md } = Grid.useBreakpoint();
    const auth = useAuth();
    const query = useJobByIdQuery({ id: id! });
    return (
        <Loader query={query}>
            {(data) => {
                const job = data.Job;
                const salary = formatSalary(job?.salaryRange?.min, job?.salaryRange?.max, job?.salaryRange?.currency);
                const { bounty, positions, companyIdentity } = getJobMeta(job);
                const empType = formatEmploymentType(job?.employmentType);
                const imageSrc = getImage(job) || getImage(job?.company);
                const avatarSize = md ? 192 : 112;
                const isInactive = job?.isActive === false;
                const postedAt = typeof job?.postedAt === "string" ? job.postedAt : undefined;
                const { allowedIdentities, disallowedIdentities } = getJobIdentityAccess(job, "name");
                const isOwner = auth.user?.profile?.sub && job?.createdBy?.id === auth.user.profile.sub;
                const shareTitle = job?.title ?? "Job";
                const shareText = `Check out ${shareTitle} on NSwap.`;

                return (
                    <CommonDetail
                        className="JobDetail"
                        serverURL={job?.serverURL}
                        backTo="/jobs"
                        backLabel="Back to jobs"
                        shareLabel="Share this job"
                        shareTitle={shareTitle}
                        shareText={shareText}
                        subscriptionTarget={
                            job
                                ? {
                                      collection: "jobs",
                                      targetID: job.id,
                                      serverURL: job.serverURL,
                                      isSubscribed: job.isSubscribed,
                                  }
                                : undefined
                        }
                        header={
                            <Space size={16} align="start" className="JobDetail__header">
                                {imageSrc && <Avatar shape="circle" size={avatarSize} src={imageSrc} />}
                                <div className="EntityDetail__headerBody JobDetail__headerBody">
                                    <Typography.Title level={1} className="JobDetail__title" delete={isInactive}>
                                        {job?.title}
                                    </Typography.Title>
                                    {companyIdentity && (
                                        <div className="JobDetail__identityRow">
                                            <IdentityTagLink
                                                identity={companyIdentity}
                                                color="success"
                                                icon={<UsergroupAddOutlined />}
                                            />
                                        </div>
                                    )}
                                    <div className="JobDetail__summary">
                                        <JobDetailsSummary
                                            companyName={job?.company?.name}
                                            location={job?.location}
                                            employmentType={empType}
                                            salary={salary}
                                            bounty={bounty}
                                            positions={positions}
                                            postedAt={postedAt}
                                            isInactive={isInactive}
                                            metaSize={[12, 8]}
                                        />
                                    </div>
                                </div>
                            </Space>
                        }
                        beforeShare={
                            <>
                                {isOwner && (
                                    <RouteButton to={`/jobs/edit/${id}`} icon={<EditOutlined />}>
                                        Edit
                                    </RouteButton>
                                )}
                                <Divider />
                                <Flex gap="32px" vertical>
                                    <Markdown>{job?.description}</Markdown>
                                    <IdentityGroups
                                        allowedIdentities={allowedIdentities}
                                        disallowedIdentities={disallowedIdentities}
                                    />
                                    <div>
                                        <ApplyButton url={job?.applyUrl} />
                                    </div>
                                </Flex>
                            </>
                        }
                        afterShare={
                            <EntityCommentsSection
                                targetId={id!}
                                relationTo={Comment_ReplyPostRelationshipInputRelationTo.Jobs}
                                serverURL={job?.serverURL}
                            />
                        }
                    />
                );
            }}
        </Loader>
    );
};

export default JobDetail;
