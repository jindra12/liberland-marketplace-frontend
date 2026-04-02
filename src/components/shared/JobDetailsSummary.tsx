import * as React from "react";
import { Link } from "react-router-dom";
import { ClockCircleOutlined, DollarOutlined, EnvironmentOutlined, GiftOutlined, HomeFilled, InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { Flex, Space, Tag, Typography } from "antd";
import { timeAgo } from "../../utils";
type JobDetailsSummaryProps = {
    companyName?: string | null;
    companyId?: string | null;
    location?: string | null;
    employmentType?: string | null;
    salary?: string | null;
    bounty?: string | null;
    positions?: string | null;
    postedAt?: string | null;
    isInactive?: boolean;
    showCompanyIcon?: boolean;
    metaSize?: React.ComponentProps<typeof Space>["size"];
};
export const JobDetailsSummary: React.FunctionComponent<JobDetailsSummaryProps> = (props) => {
    const showCompanyIcon = props.showCompanyIcon === undefined ? false : props.showCompanyIcon;
    const metaSize: React.ComponentProps<typeof Space>["size"] = props.metaSize ?? [12, 8];
    return (
        <Flex vertical gap={4}>
            <Space size={metaSize} wrap>
                {props.companyName && (
                    <Typography.Text strong>
                        {showCompanyIcon && (
                            <>
                                <HomeFilled />{" "}
                            </>
                        )}
                        {props.companyId ? <Link to={`/companies/${props.companyId}`}>{props.companyName}</Link> : props.companyName}
                    </Typography.Text>
                )}
                {props.location && (
                    <Typography.Text type="secondary">
                        <EnvironmentOutlined /> {props.location}
                    </Typography.Text>
                )}
                {props.employmentType && <Tag color="blue">{props.employmentType}</Tag>}
                {props.positions && (
                    <Typography.Text type="secondary">
                        <TeamOutlined /> {props.positions}
                    </Typography.Text>
                )}
                {props.postedAt && (
                    <Typography.Text type="secondary">
                        <ClockCircleOutlined /> {timeAgo(props.postedAt)}
                    </Typography.Text>
                )}
            </Space>
            {(props.salary || props.bounty) && (
                <Space size={metaSize} wrap>
                    {props.salary && (
                        <Typography.Text strong>
                            <DollarOutlined /> {props.salary}
                        </Typography.Text>
                    )}
                    {props.bounty && (
                        <Typography.Text strong>
                            <GiftOutlined /> Bounty: {props.bounty}
                        </Typography.Text>
                    )}
                </Space>
            )}
            {props.isInactive && (
                <Typography.Text type="secondary" className="JobInactiveNotice">
                    <InfoCircleOutlined /> This job listing is no longer active.
                </Typography.Text>
            )}
        </Flex>
    );
};
