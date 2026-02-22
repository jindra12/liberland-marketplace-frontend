import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Divider, Flex, Grid, Space, Typography } from "antd";
import { EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useJobByIdQuery,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { formatSalary, formatEmploymentType } from "../../utils";
import { ApplyButton } from "../ApplyButton";
import { Markdown } from "../Markdown";
import { IdentityGroups } from "./IdentityGroups";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getJobIdentityAccess, getJobMeta } from "../shared/jobDerived";
import { JobDetailsSummary } from "../shared/JobDetailsSummary";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";

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
                const url = job?.image?.url || job?.company?.image?.url;
                const avatarSize = md ? 192 : 112;
                const isInactive = job?.isActive === false;
                const postedAt = typeof job?.postedAt === "string" ? job.postedAt : undefined;
                const { allowedIdentities, disallowedIdentities } = getJobIdentityAccess(job, "name");
                const isOwner = auth.user?.profile?.sub && job?.createdBy?.id === auth.user.profile.sub;

                return (
                    <Flex flex={1} vertical gap="8px">
                        <Space size={16} align="start" className="JobDetail__header">
                            {url && <Avatar shape="circle" size={avatarSize} src={`${BACKEND_URL}${url}`} />}
                            <div>
                                <Typography.Title level={1} className="JobDetail__title" delete={isInactive}>
                                    <Flex justify="space-between" align="center" gap="16px" wrap>
                                        {job?.title}
                                        {companyIdentity && (
                                            <IdentityTagLink
                                                identity={companyIdentity}
                                                color="success"
                                                icon={<UsergroupAddOutlined />}
                                            />
                                        )}
                                    </Flex>
                                </Typography.Title>
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
                        <EntityCommentsSection
                            targetId={id!}
                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Jobs}
                            title="Comments"
                        />
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default JobDetail;
