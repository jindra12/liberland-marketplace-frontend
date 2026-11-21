// eslint-disable-next-line no-restricted-syntax -- Workspace instructions require a default React runtime import.
import React from "react";

import { FileTextOutlined, RocketOutlined, ShopOutlined, TeamOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Flex, Space, Typography } from "antd";

import type { Category } from "../tour/types";

type PublishCategoryPickerProps = {
    onSelect: (category: Category) => void;
};

export const PublishCategoryPicker: React.FunctionComponent<PublishCategoryPickerProps> = (props) => {
    return (
        <Space direction="vertical" size={16} className="Publish__categories">
            <Button block className="Publish__category" onClick={() => props.onSelect("publish-job")}>
                <Space size={16}>
                    <ToolOutlined className="Publish__categoryIcon" />
                    <Flex vertical gap={4}>
                        <Typography.Text strong className="Publish__categoryTitle">Job</Typography.Text>
                        <Typography.Text type="secondary">Post a job listing</Typography.Text>
                    </Flex>
                </Space>
            </Button>
            <Button block className="Publish__category" onClick={() => props.onSelect("publish-company")}>
                <Space size={16}>
                    <TeamOutlined className="Publish__categoryIcon" />
                    <Flex vertical gap={4}>
                        <Typography.Text strong className="Publish__categoryTitle">Company</Typography.Text>
                        <Typography.Text type="secondary">Create a company profile</Typography.Text>
                    </Flex>
                </Space>
            </Button>
            <Button block className="Publish__category" onClick={() => props.onSelect("publish-product")}>
                <Space size={16}>
                    <ShopOutlined className="Publish__categoryIcon" />
                    <Flex vertical gap={4}>
                        <Typography.Text strong className="Publish__categoryTitle">Product</Typography.Text>
                        <Typography.Text type="secondary">List a product or service</Typography.Text>
                    </Flex>
                </Space>
            </Button>
            <Button block className="Publish__category" onClick={() => props.onSelect("publish-post")}>
                <Space size={16}>
                    <FileTextOutlined className="Publish__categoryIcon" />
                    <Flex vertical gap={4}>
                        <Typography.Text strong className="Publish__categoryTitle">Post</Typography.Text>
                        <Typography.Text type="secondary">Write a post</Typography.Text>
                    </Flex>
                </Space>
            </Button>
            <Button block className="Publish__category" onClick={() => props.onSelect("publish-startup")}>
                <Space size={16}>
                    <RocketOutlined className="Publish__categoryIcon" />
                    <Flex vertical gap={4}>
                        <Typography.Text strong className="Publish__categoryTitle">Venture</Typography.Text>
                        <Typography.Text type="secondary">Launch a venture</Typography.Text>
                    </Flex>
                </Space>
            </Button>
        </Space>
    );
};
