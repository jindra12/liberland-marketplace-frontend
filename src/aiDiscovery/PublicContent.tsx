import React from "react";
import { Typography, List, Space } from "antd";
import { useIsClient } from "usehooks-ts";
import type { PublicPageContent } from "./types";
import { isWebsiteUrl, readablePageUrl } from "./utils";

type PublicContentProps = {
    content: PublicPageContent;
    readableOnly?: boolean;
};

// Real, visible HTML until hydration replaces it with the interactive marketplace.
// format=html retains this lightweight view, including in JavaScript browsers.
export const PublicContent: React.FunctionComponent<PublicContentProps> = (props) => {
    const isClient = useIsClient();
    if (isClient && !props.readableOnly) {
        return null;
    }
    return (
        <Typography className="public-marketplace-content" aria-label="Marketplace listings">
            <Typography.Title level={1}>{props.content.title}</Typography.Title>
            <Typography.Paragraph>{props.content.description}</Typography.Paragraph>
            <List
                dataSource={props.content.items}
                locale={{ emptyText: "No records displayed. See the lookup description above." }}
                renderItem={(item) => (
                    <List.Item>
                        <Space direction="vertical">
                            <Typography.Link href={item.url}>{item.name}</Typography.Link>
                            <Typography.Paragraph>{item.description}</Typography.Paragraph>
                            {item.affiliation && (
                                <Typography.Paragraph>
                                    Tribe affiliation:{" "}
                                    <Typography.Link href={item.affiliation.url}>
                                        {item.affiliation.name}
                                    </Typography.Link>
                                </Typography.Paragraph>
                            )}
                            {item.website && isWebsiteUrl(item.website) && (
                                <Typography.Link href={item.website}>Official website</Typography.Link>
                            )}
                            {item.services?.map((service) => (
                                <Typography.Paragraph key={service.url}>
                                    <Typography.Link href={service.url}>{service.name}</Typography.Link>:{" "}
                                    {service.description}
                                </Typography.Paragraph>
                            ))}
                        </Space>
                    </List.Item>
                )}
            />
            <Space wrap>
                {props.content.links.map((link) => (
                    <Typography.Link key={link.url} href={readablePageUrl(link.url, props.readableOnly)}>
                        {link.name}
                    </Typography.Link>
                ))}
            </Space>
            <Typography.Paragraph>
                <Typography.Link href="/llms.txt">Search and navigation guide</Typography.Link>
            </Typography.Paragraph>
        </Typography>
    );
};
