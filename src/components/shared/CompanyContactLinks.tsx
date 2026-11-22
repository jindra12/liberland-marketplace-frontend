import * as React from "react";

import { GlobalOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Flex, List, Typography } from "antd";

import type { IdentityTagItem } from "../../types";

type CompanyContactLinksProps = {
    identity?: IdentityTagItem;
    website?: string | null;
    email?: unknown;
    phone?: string | null;
    className?: string;
    variant?: "detail" | "compact";
};
type ContactItem = {
    key: string;
    title: string;
    href: string;
    icon: React.ReactNode;
    text: string;
    external: boolean;
};
export const CompanyContactLinks: React.FunctionComponent<CompanyContactLinksProps> = (props) => {
    const variant = props.variant === undefined ? "detail" : props.variant;
    const normalizedEmail = typeof props.email === "string" ? props.email : undefined;
    const items: ContactItem[] = [
        ...(props.website
            ? [
                  {
                      key: "website",
                      title: "Website",
                      href: props.website,
                      icon: <GlobalOutlined />,
                      text: props.website,
                      external: true,
                  },
              ]
            : []),
        ...(normalizedEmail
            ? [
                  {
                      key: "email",
                      title: "Email",
                      href: `mailto:${normalizedEmail}`,
                      icon: <MailOutlined />,
                      text: normalizedEmail,
                      external: false,
                  },
              ]
            : []),
        ...(props.phone
            ? [
                  {
                      key: "phone",
                      title: "Phone",
                      href: `tel:${props.phone}`,
                      icon: <PhoneOutlined />,
                      text: props.phone,
                      external: false,
                  },
              ]
            : []),
    ];
    if (items.length === 0) {
        return null;
    }
    const resolvedClassName = [
        "CompanyContactLinks",
        variant === "compact" ? "CompanyContactLinks--compact" : "CompanyContactLinks--detail CompanyDetailLinks",
        props.className,
    ]
        .filter(Boolean)
        .join(" ");
    if (variant === "compact") {
        return (
            <Flex wrap gap={12} className={resolvedClassName}>
                {items.map((item) => (
                    <Typography.Link
                        key={item.key}
                        className="CompanyContactLinks__value"
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noreferrer" : undefined}
                    >
                        {item.icon}
                        {item.title}
                    </Typography.Link>
                ))}
            </Flex>
        );
    }
    return (
        <List
            itemLayout="vertical"
            size="small"
            header={<Typography.Text className="CompanyContactLinks__heading">Contacts</Typography.Text>}
            bordered
            dataSource={items}
            className={resolvedClassName}
            renderItem={(item) => (
                <List.Item key={item.key}>
                    <div className="CompanyContactLinks__detailRow">
                        <Typography.Text className="CompanyContactLinks__label">{item.title}</Typography.Text>
                        <Typography.Link
                            className="CompanyContactLinks__value CompanyContactLinks__value--detail"
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noreferrer" : undefined}
                        >
                            {item.icon}
                            <span>{item.text}</span>
                        </Typography.Link>
                    </div>
                </List.Item>
            )}
        />
    );
};
