import * as React from "react";
import { Link } from "react-router-dom";
import {
    ClockCircleOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    GiftOutlined,
    HomeFilled,
    InfoCircleOutlined,
    TeamOutlined,
} from "@ant-design/icons";
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

export const JobDetailsSummary: React.FunctionComponent<JobDetailsSummaryProps> = ({
    companyName,
    companyId,
    location,
    employmentType,
    salary,
    bounty,
    positions,
    postedAt,
    isInactive,
    showCompanyIcon = false,
    metaSize = [12, 8],
}) => (
    <Flex vertical gap={4}>
        <Space size={metaSize} wrap>
            {companyName && (
                <Typography.Text strong>
                    {showCompanyIcon && <><HomeFilled /> </>}
                    {companyId ? (
                        <Link to={`/companies/${companyId}`}>{companyName}</Link>
                    ) : (
                        companyName
                    )}
                </Typography.Text>
            )}
            {location && (
                <Typography.Text type="secondary">
                    <EnvironmentOutlined /> {location}
                </Typography.Text>
            )}
            {employmentType && <Tag color="blue">{employmentType}</Tag>}
            {positions && (
                <Typography.Text type="secondary">
                    <TeamOutlined /> {positions}
                </Typography.Text>
            )}
            {postedAt && (
                <Typography.Text type="secondary">
                    <ClockCircleOutlined /> {timeAgo(postedAt)}
                </Typography.Text>
            )}
        </Space>
        {(salary || bounty) && (
            <Space size={metaSize} wrap>
                {salary && (
                    <Typography.Text strong>
                        <DollarOutlined /> {salary}
                    </Typography.Text>
                )}
                {bounty && (
                    <Typography.Text strong>
                        <GiftOutlined /> Bounty: {bounty}
                    </Typography.Text>
                )}
            </Space>
        )}
        {isInactive && (
            <Typography.Text type="secondary" className="JobInactiveNotice">
                <InfoCircleOutlined /> This job listing is no longer active.
            </Typography.Text>
        )}
    </Flex>
);
