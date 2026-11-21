import * as React from "react";

import { useNavigate } from "react-router-dom";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Typography } from "antd";

import { routes } from "../../routes";
import type { Category } from "../tour/types";

import { CompanyForm } from "./CompanyForm";
import { JobForm } from "./JobForm";
import { PostForm } from "./PostForm";
import { ProductForm } from "./ProductForm";
import { PublishCategoryPicker } from "./PublishCategoryPicker";
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
                    <PublishCategoryPicker onSelect={setCategory} />
                </div>
            );
    }
};
