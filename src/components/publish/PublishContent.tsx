import React from "react";
import { Button, Card, Typography, Space } from "antd";
import { ArrowLeftOutlined, ShopOutlined, TeamOutlined, ToolOutlined } from "@ant-design/icons";
import { JobForm } from "./JobForm";
import { CompanyForm } from "./CompanyForm";
import { ProductForm } from "./ProductForm";

type Category = "job" | "company" | "product" | null;

export const PublishContent: React.FunctionComponent = () => {
    const [category, setCategory] = React.useState<Category>(null);

    if (category === "job") {
        return (
            <div className="Publish">
                <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => setCategory(null)}>
                    Back
                </Button>
                <Typography.Title level={3}>Post a Job</Typography.Title>
                <JobForm mode="create" />
            </div>
        );
    }

    if (category === "company") {
        return (
            <div className="Publish">
                <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => setCategory(null)}>
                    Back
                </Button>
                <Typography.Title level={3}>Create a Company</Typography.Title>
                <CompanyForm mode="create" />
            </div>
        );
    }

    if (category === "product") {
        return (
            <div className="Publish">
                <Button className="Publish__back" icon={<ArrowLeftOutlined />} onClick={() => setCategory(null)}>
                    Back
                </Button>
                <Typography.Title level={3}>List a Product</Typography.Title>
                <ProductForm mode="create" />
            </div>
        );
    }

    return (
        <div className="Publish">
            <Typography.Title level={2}>Publish your ad</Typography.Title>
            <Typography.Paragraph type="secondary">
                Choose what you'd like to publish
            </Typography.Paragraph>
            <Space direction="vertical" size={16} className="Publish__categories">
                <Card hoverable className="Publish__category" onClick={() => setCategory("job")}>
                    <Space size={16}>
                        <ToolOutlined className="Publish__categoryIcon" />
                        <div>
                            <Typography.Title level={4} className="Publish__categoryTitle">Job</Typography.Title>
                            <Typography.Text type="secondary">Post a job listing</Typography.Text>
                        </div>
                    </Space>
                </Card>
                <Card hoverable className="Publish__category" onClick={() => setCategory("company")}>
                    <Space size={16}>
                        <TeamOutlined className="Publish__categoryIcon" />
                        <div>
                            <Typography.Title level={4} className="Publish__categoryTitle">Company</Typography.Title>
                            <Typography.Text type="secondary">Create a company profile</Typography.Text>
                        </div>
                    </Space>
                </Card>
                <Card hoverable className="Publish__category" onClick={() => setCategory("product")}>
                    <Space size={16}>
                        <ShopOutlined className="Publish__categoryIcon" />
                        <div>
                            <Typography.Title level={4} className="Publish__categoryTitle">Product</Typography.Title>
                            <Typography.Text type="secondary">List a product or service</Typography.Text>
                        </div>
                    </Space>
                </Card>
            </Space>
        </div>
    );
};
