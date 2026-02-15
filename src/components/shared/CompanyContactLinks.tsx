import * as React from "react";
import { GlobalOutlined, MailOutlined, PhoneOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import { IdentityTagItem, IdentityTagLink } from "./IdentityTagLink";

type CompanyContactLinksProps = {
    identity?: IdentityTagItem;
    website?: string | null;
    email?: unknown;
    phone?: string | null;
    className?: string;
    hideWhenEmpty?: boolean;
    emptyText?: React.ReactNode;
};

export const CompanyContactLinks: React.FunctionComponent<CompanyContactLinksProps> = ({
    identity,
    website,
    email,
    phone,
    className,
    hideWhenEmpty = false,
    emptyText,
}) => {
    const normalizedEmail = typeof email === "string" ? email : undefined;
    const hasContent = Boolean(identity?.name || website || normalizedEmail || phone);

    if (!hasContent) {
        if (hideWhenEmpty) {
            return null;
        }

        if (!emptyText) {
            return null;
        }

        return typeof emptyText === "string"
            ? <Typography.Text type="secondary">{emptyText}</Typography.Text>
            : <>{emptyText}</>;
    }

    return (
        <Space size={[8, 8]} wrap className={className}>
            {identity?.name && (
                <IdentityTagLink
                    identity={identity}
                    color="success"
                    icon={<UsergroupAddOutlined />}
                />
            )}
            {website && (
                <Typography.Link href={website} target="_blank" rel="noreferrer">
                    <GlobalOutlined /> {website}
                </Typography.Link>
            )}
            {normalizedEmail && (
                <Typography.Link href={`mailto:${normalizedEmail}`}>
                    <MailOutlined /> {normalizedEmail}
                </Typography.Link>
            )}
            {phone && (
                <Typography.Link href={`tel:${phone}`}>
                    <PhoneOutlined /> {phone}
                </Typography.Link>
            )}
        </Space>
    );
};
