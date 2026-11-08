import * as React from "react";

import { useNavigate } from "react-router-dom";

import {
    ArrowLeftOutlined,
    FileTextOutlined,
    RocketOutlined,
    ShopOutlined,
    TeamOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Space, Typography } from "antd";

import { routes } from "../../routes";
import type { Category } from "../tour/types";

import { CompanyForm } from "./CompanyForm";
import { JobForm } from "./JobForm";
import { PostForm } from "./PostForm";
import { ProductForm } from "./ProductForm";
import { StartupForm } from "./StartupForm";
import { usePublicationCategory } from "./usePublicationCategory";

export interface PublishFormsProps {
    defaultCategory?: Category;
    url: string;
}
export const PublishForms: React.FunctionComponent<PublishFormsProps> = (props) => {
    const { category, setCategory } = usePublicationCategory(props.defaultCategory);
    const navigate = useNavigate();
    const backButton = (
        <Popconfirm
            disabled={Boolean(props.defaultCategory)}
            title="Discard this draft?"
            description="Unsaved changes will be lost."
            okText="Discard draft"
            cancelText="Keep editing"
            onConfirm={() => {
                setCategory(undefined);
            }}
        >
            <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => {
                if (props.defaultCategory) {
                    navigate(routes.home.route);
                }
            }}>
                Back
            </Button>
        </Popconfirm>
    );

    switch (category) {
        case "publish-job":
            return (
                <div className="Publish">
                    {backButton}
                    <Typography.Title level={3}>Post a Job</Typography.Title>
                    <JobForm mode="create" url={props.url} />
                </div>
            );
        case "publish-company":
            return (
                <div className="Publish">
                    {backButton}
                    <Typography.Title level={3}>Create a Company</Typography.Title>
                    <CompanyForm mode="create" url={props.url} />
                </div>
            );
        case "publish-product":
            return (
                <div className="Publish">
                    {backButton}
                    <Typography.Title level={3}>List a Product</Typography.Title>
                    <ProductForm mode="create" url={props.url} />
                </div>
            );
        case "publish-post":
            return (
                <div className="Publish">
                    {backButton}
                    <Typography.Title level={3}>Write a Post</Typography.Title>
                    <PostForm mode="create" url={props.url} />
                </div>
            );
        case "publish-startup":
            return (
                <div className="Publish">
                    {backButton}
                    <Typography.Title level={3}>Launch a Venture</Typography.Title>
                    <StartupForm mode="create" url={props.url} />
                </div>
            );
        default:
            return (
                <div className="Publish">
                    <Typography.Title level={2}>Create</Typography.Title>
                    <Typography.Paragraph type="secondary">Choose what you'd like to publish</Typography.Paragraph>
                    <Space direction="vertical" size={16} className="Publish__categories">
                        <Button block className="Publish__category" onClick={() => setCategory("publish-job")}>
                            <Space size={16}>
                                <ToolOutlined className="Publish__categoryIcon" />
                                <div>
                                    <Typography.Text strong className="Publish__categoryTitle">
                                        Job
                                    </Typography.Text>
                                    <Typography.Text type="secondary">Post a job listing</Typography.Text>
                                </div>
                            </Space>
                        </Button>
                        <Button block className="Publish__category" onClick={() => setCategory("publish-company")}>
                            <Space size={16}>
                                <TeamOutlined className="Publish__categoryIcon" />
                                <div>
                                    <Typography.Text strong className="Publish__categoryTitle">
                                        Company
                                    </Typography.Text>
                                    <Typography.Text type="secondary">Create a company profile</Typography.Text>
                                </div>
                            </Space>
                        </Button>
                        <Button block className="Publish__category" onClick={() => setCategory("publish-product")}>
                            <Space size={16}>
                                <ShopOutlined className="Publish__categoryIcon" />
                                <div>
                                    <Typography.Text strong className="Publish__categoryTitle">
                                        Product
                                    </Typography.Text>
                                    <Typography.Text type="secondary">List a product or service</Typography.Text>
                                </div>
                            </Space>
                        </Button>
                        <Button block className="Publish__category" onClick={() => setCategory("publish-post")}>
                            <Space size={16}>
                                <FileTextOutlined className="Publish__categoryIcon" />
                                <div>
                                    <Typography.Text strong className="Publish__categoryTitle">
                                        Post
                                    </Typography.Text>
                                    <Typography.Text type="secondary">Write a post</Typography.Text>
                                </div>
                            </Space>
                        </Button>
                        <Button block className="Publish__category" onClick={() => setCategory("publish-startup")}>
                            <Space size={16}>
                                <RocketOutlined className="Publish__categoryIcon" />
                                <div>
                                    <Typography.Text strong className="Publish__categoryTitle">
                                        Venture
                                    </Typography.Text>
                                    <Typography.Text type="secondary">Launch a venture</Typography.Text>
                                </div>
                            </Space>
                        </Button>
                    </Space>
                </div>
            );
    }
};
