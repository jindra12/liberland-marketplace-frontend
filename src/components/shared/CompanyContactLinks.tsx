import * as React from "react";
import { GlobalOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Flex, List, Typography } from "antd";
import { IdentityTagItem } from "./IdentityTagLink";

type CompanyContactLinksProps = {
    identity?: IdentityTagItem;
    website?: string | null;
    email?: unknown;
    phone?: string | null;
    className?: string;
};

export const CompanyContactLinks: React.FunctionComponent<CompanyContactLinksProps> = ({
    identity,
    website,
    email,
    phone,
    className,
}) => {
    const normalizedEmail = typeof email === "string" ? email : undefined;
    const hasContent = Boolean(identity?.name || website || normalizedEmail || phone);
    const items: Array<{ key: string; title: string; value: React.ReactNode; }> = [];

    if (website) {
        items.push({
            key: "website",
            title: "Website:",
            value: (
                <Typography.Link href={website} target="_blank" rel="noreferrer">
                    <GlobalOutlined /> {website}
                </Typography.Link>
            ),
        });
    }

    if (normalizedEmail) {
        items.push({
            key: "email",
            title: "Email:",
            value: (
                <Typography.Link href={`mailto:${normalizedEmail}`}>
                    <MailOutlined /> {normalizedEmail}
                </Typography.Link>
            ),
        });
    }

    if (phone) {
        items.push({
            key: "phone",
            title: "Phone:",
            value: (
                <Typography.Link href={`tel:${phone}`}>
                    <PhoneOutlined /> {phone}
                </Typography.Link>
            ),
        });
    }

    if (!hasContent) {
        return null;
    }

    return (
        <List
            itemLayout="vertical"
            size="small"
            header="Contacts"
            rootClassName="CompanyDetailLinks"
            bordered
            dataSource={items}
            className={className}
            renderItem={(item) => (
                <List.Item key={item.key}>
                    <Flex wrap gap="16px" align="center" justify="space-between">
                        <strong>{item.title}</strong> {item.value}
                    </Flex>
                </List.Item>
            )}
        />
    );
};
