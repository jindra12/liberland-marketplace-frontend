import * as React from "react";
import { Avatar,
    Divider,
    Flex,
    Grid,
    Space,
    Typography,
    Button
} from "antd";
import { Link, useParams } from "react-router-dom";
import { EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { formatSalary, formatEmploymentType, getImage } from "../../utils";
import { ApplyButton } from "../ApplyButton";
import { Markdown } from "../Markdown";
import { IdentityGroups } from "./IdentityGroups";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getJobIdentityAccess, getJobMeta } from "../shared/jobDerived";
import { JobDetailsSummary } from "../shared/JobDetailsSummary";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { useJobByIdQuery } from "../hooks";
import { DetailShareSection } from "../share/DetailShareSection";

const JobDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { md } = Grid.useBreakpoint();
    const auth = useAuth();
    const query = useJobByIdQuery({ id: id! });
    return (
        <Loader query={query}>
            {(data) => {
                const job = data.Job;
                const salary = formatSalary(
                    job?.salaryRange?.min,
                    job?.salaryRange?.max,
                    job?.salaryRange?.currency
                );
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
                    <Flex flex={1} vertical gap={12}>
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
                        {isOwner && (
                            <Link to={`/jobs/edit/${id}`}>
                                <Button icon={<EditOutlined />}>Edit</Button>
                            </Link>
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
                        <Divider />
                        <DetailShareSection
                            label="Share this job"
                            title={shareTitle}
                            text={shareText}
                            subscriptionTarget={job ? {
                                collection: "jobs",
                                targetID: job.id,
                                serverURL: job.serverURL,
                                isSubscribed: job.isSubscribed,
                            } : undefined}
                        />
                        <Divider />
                        <EntityCommentsSection
                            targetId={id!}
                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Jobs}
                        />
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default JobDetail;
