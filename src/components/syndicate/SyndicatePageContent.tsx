import * as React from "react";

import { DownloadOutlined } from "@ant-design/icons";
import { Card, Flex, List, Space, Tag, Typography } from "antd";

import type { SyndicatePage } from "./constants";
import { SyndicateDownloadAction } from "./SyndicateDownloadAction";

type SyndicatePageContentProps = {
    page: SyndicatePage;
    pageIndex: number;
    pageCount: number;
};

export const SyndicatePageContent: React.FunctionComponent<SyndicatePageContentProps> = (props) => {
    return (
        <Flex vertical gap={24} className="SyndicateModal__content">
            <Flex vertical gap={16} className="SyndicateModal__intro">
                <Tag color="blue" className="SyndicateModal__eyebrow">
                    {props.page.eyebrow}
                </Tag>
                <Typography.Title level={3} className="SyndicateModal__title">
                    {props.page.title}
                </Typography.Title>
                <Typography.Paragraph className="SyndicateModal__description">
                    {props.page.description}
                </Typography.Paragraph>
            </Flex>

            <Card className="SyndicateModal__pageCard">
                <Flex vertical gap={20} className="SyndicateModal__pageCardContent">
                    <List
                        size="small"
                        dataSource={props.page.highlights}
                        className="SyndicateModal__highlights"
                        renderItem={(item) => <List.Item className="SyndicateModal__highlight">• {item}</List.Item>}
                    />
                    {props.page.command && (
                        <Space direction="vertical" size={10} className="SyndicateModal__commandBlock">
                            {props.page.command.map((line) => (
                                <Typography.Text key={line} code className="SyndicateModal__commandLine">
                                    {line}
                                </Typography.Text>
                            ))}
                        </Space>
                    )}
                    {props.page.downloadLabel && <SyndicateDownloadAction label={props.page.downloadLabel} />}
                    {props.page.links && (
                        <Flex wrap gap={12} className="SyndicateModal__linkRow">
                            {props.page.links.map((link) => (
                                <Typography.Link
                                    key={link.label}
                                    href={link.href}
                                    download={link.download}
                                    target={link.download ? undefined : "_blank"}
                                    rel={link.download ? undefined : "noreferrer"}
                                    className="SyndicateModal__link"
                                >
                                    {link.download && <DownloadOutlined className="SyndicateModal__linkIcon" />}
                                    {link.label}
                                </Typography.Link>
                            ))}
                        </Flex>
                    )}
                </Flex>
            </Card>

            <Flex align="center" justify="space-between" wrap gap={14} className="SyndicateModal__pageMeta">
                <Typography.Text className="SyndicateModal__pageCount">
                    Page {props.pageIndex + 1} of {props.pageCount}
                </Typography.Text>
                <Typography.Text type="secondary" className="SyndicateModal__pageHint">
                    Use Back, Next, or jump to any page number.
                </Typography.Text>
            </Flex>
        </Flex>
    );
};
