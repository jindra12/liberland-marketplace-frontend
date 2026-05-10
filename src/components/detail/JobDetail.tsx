import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useParams } from "react-router-dom";

import { EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Divider, Flex, Grid, Space, Typography } from "antd";

import { Comment_ReplyPostRelationshipInputRelationTo, Job } from "../../generated/graphql";
import { decodeServerUrlSegment, routes } from "../../routes";
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
    const { id, serverUrl } = useParams<{ id: string; serverUrl: string }>();
    const routeServerURL = decodeServerUrlSegment(serverUrl ?? "");
    const { md } = Grid.useBreakpoint();
    const auth = useAuth();
    const query = useJobByIdQuery({ id: id!, url: routeServerURL });
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
                        serverURL={job?.serverURL ?? routeServerURL}
                        reportPath={routes.jobs.detail.getLink(job as Job)}
                        backTo={routes.jobs.route}
                        backLabel="Back to jobs"
                        shareLabel="Share this job"
                        shareTitle={shareTitle}
                        shareText={shareText}
                        subscriptionTarget={
                            job
                                ? {
                                      collection: "jobs",
                                      targetID: job.id,
                                      serverURL: job.serverURL ?? routeServerURL,
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
                                    <RouteButton to={routes.jobs.edit.getLink(job as Job)} icon={<EditOutlined />}>
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
                        sections={[{
                            key: "comments",
                            children: (
                                <EntityCommentsSection
                                    targetId={id!}
                                    relationTo={Comment_ReplyPostRelationshipInputRelationTo.Jobs}
                                    serverURL={job?.serverURL ?? routeServerURL}
                                />
                            )
                        }]}
                    />
                );
            }}
        </Loader>
    );
};

export default JobDetail;
