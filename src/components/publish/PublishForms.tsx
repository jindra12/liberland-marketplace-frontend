import * as React from "react";

import {
    ArrowLeftOutlined,
    FileTextOutlined,
    RocketOutlined,
    ShopOutlined,
    TeamOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";

import { CompanyForm } from "./CompanyForm";
import { JobForm } from "./JobForm";
import { PostForm } from "./PostForm";
import { ProductForm } from "./ProductForm";
import { StartupForm } from "./StartupForm";

type Category = "job" | "company" | "product" | "post" | "startup";
export interface PublishFormsProps {
    url: string;
}
export const PublishForms: React.FunctionComponent<PublishFormsProps> = (props) => {
    const [category, setCategory] = React.useState<Category>();
    if (category === "job") {
        return (
            <div className="Publish">
                <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => setCategory(undefined)}>
                    Back
                </Button>
                <Typography.Title level={3}>Post a Job</Typography.Title>
                <JobForm mode="create" url={props.url} />
            </div>
        );
    }
    if (category === "company") {
        return (
            <div className="Publish">
                <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => setCategory(undefined)}>
                    Back
                </Button>
                <Typography.Title level={3}>Create a Company</Typography.Title>
                <CompanyForm mode="create" url={props.url} />
            </div>
        );
    }
    if (category === "product") {
        return (
            <div className="Publish">
                <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => setCategory(undefined)}>
                    Back
                </Button>
                <Typography.Title level={3}>List a Product</Typography.Title>
                <ProductForm mode="create" url={props.url} />
            </div>
        );
    }
    if (category === "post") {
        return (
            <div className="Publish">
                <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => setCategory(undefined)}>
                    Back
                </Button>
                <Typography.Title level={3}>Write a Post</Typography.Title>
                <PostForm mode="create" url={props.url} />
            </div>
        );
    }
    if (category === "startup") {
        return (
            <div className="Publish">
                <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => setCategory(undefined)}>
                    Back
                </Button>
                <Typography.Title level={3}>Launch a Venture</Typography.Title>
                <StartupForm mode="create" url={props.url} />
            </div>
        );
    }
    return (
        <div className="Publish">
            <Typography.Title level={2}>Publish your ad</Typography.Title>
            <Typography.Paragraph type="secondary">Choose what you'd like to publish</Typography.Paragraph>
            <Space direction="vertical" size={16} className="Publish__categories">
                <Card hoverable className="Publish__category" onClick={() => setCategory("job")}>
                    <Space size={16}>
                        <ToolOutlined className="Publish__categoryIcon" />
                        <div>
                            <Typography.Title level={4} className="Publish__categoryTitle">
                                Job
                            </Typography.Title>
                            <Typography.Text type="secondary">Post a job listing</Typography.Text>
                        </div>
                    </Space>
                </Card>
                <Card hoverable className="Publish__category" onClick={() => setCategory("company")}>
                    <Space size={16}>
                        <TeamOutlined className="Publish__categoryIcon" />
                        <div>
                            <Typography.Title level={4} className="Publish__categoryTitle">
                                Company
                            </Typography.Title>
                            <Typography.Text type="secondary">Create a company profile</Typography.Text>
                        </div>
                    </Space>
                </Card>
                <Card hoverable className="Publish__category" onClick={() => setCategory("product")}>
                    <Space size={16}>
                        <ShopOutlined className="Publish__categoryIcon" />
                        <div>
                            <Typography.Title level={4} className="Publish__categoryTitle">
                                Product
                            </Typography.Title>
                            <Typography.Text type="secondary">List a product or service</Typography.Text>
                        </div>
                    </Space>
                </Card>
                <Card hoverable className="Publish__category" onClick={() => setCategory("post")}>
                    <Space size={16}>
                        <FileTextOutlined className="Publish__categoryIcon" />
                        <div>
                            <Typography.Title level={4} className="Publish__categoryTitle">
                                Post
                            </Typography.Title>
                            <Typography.Text type="secondary">Write a post</Typography.Text>
                        </div>
                    </Space>
                </Card>
                <Card hoverable className="Publish__category" onClick={() => setCategory("startup")}>
                    <Space size={16}>
                        <RocketOutlined className="Publish__categoryIcon" />
                        <div>
                            <Typography.Title level={4} className="Publish__categoryTitle">
                                Venture
                            </Typography.Title>
                            <Typography.Text type="secondary">Launch a venture</Typography.Text>
                        </div>
                    </Space>
                </Card>
            </Space>
        </div>
    );
};
