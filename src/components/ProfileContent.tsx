import React from "react";
import {
    Avatar, Button, Card, Descriptions, Divider, Form, Input, message, Space, Tabs, Tag, Typography,
} from "antd";
import {
    PlusOutlined, UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useChangePasswordMutation,
    useUpdateUserNameMutation } from "../authApi";

import { formatEmploymentType } from "../utils";
import {
    useDeleteCompanyMutation,
    useDeleteJobMutation,
    useDeleteProductMutation,
    useDeleteStartupMutation,
    useListCompaniesByCreatorQuery,
    useListJobsByCreatorQuery,
    useListProductsByCreatorQuery,
    useListStartupsByCreatorQuery,
} from "./hooks";
import { LoginButton } from "./LoginButton";
import { ProfileListingList } from "./ProfileListingList";
import { RouteButton } from "./RouteButton";

export const ProfileContent: React.FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const profile = auth.user?.profile;
    const userId = profile?.sub;
    const emailVerified = profile?.email_verified;

    const [nicknameForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const nicknameMutation = useUpdateUserNameMutation();
    const passwordMutation = useChangePasswordMutation();

    const deleteJobMutation = useDeleteJobMutation();
    const deleteCompanyMutation = useDeleteCompanyMutation();
    const deleteProductMutation = useDeleteProductMutation();
    const deleteStartupMutation = useDeleteStartupMutation();

    const jobsQuery = useListJobsByCreatorQuery(
        { userId, draft: true },
        { enabled: !!userId, refetchOnMount: "always" },
    );
    const companiesQuery = useListCompaniesByCreatorQuery(
        { userId, draft: true },
        { enabled: !!userId, refetchOnMount: "always" },
    );

    const startupsQuery = useListStartupsByCreatorQuery(
        { userId, draft: true },
        { enabled: !!userId, refetchOnMount: "always" },
    );

    const companyIds = (companiesQuery.data?.Companies?.docs ?? []).map((c) => c.id);
    const productsQuery = useListProductsByCreatorQuery(
        { companyIds, draft: true },
        { enabled: companyIds.length > 0, refetchOnMount: "always" },
    );

    const handleNickname = async (values: { url: string; name: string }) => {
        try {
            await nicknameMutation.mutateAsync(values);
            await auth.signinSilent();
            message.success("Nickname updated");
            nicknameForm.resetFields();
        } catch (error) {
            console.error("Failed to update nickname", error);
            message.error("Failed to update nickname");
        }
    };

    const handlePassword = async (values: { url: string; currentPassword: string; newPassword: string; confirm: string }) => {
        if (values.newPassword !== values.confirm) {
            message.error("Passwords do not match");
            return;
        }
        try {
            await passwordMutation.mutateAsync(values);
            message.success("Password changed");
            passwordForm.resetFields();
        } catch (error) {
            console.error("Failed to change password", error);
            message.error("Failed to change password");
        }
    };

    const jobs = jobsQuery.data?.Jobs?.docs ?? [];
    const companies = companiesQuery.data?.Companies?.docs ?? [];
    const products = productsQuery.data?.Products?.docs ?? [];
    const startups = startupsQuery.data?.Startups?.docs ?? [];
    const listingTabs = [
        {
            key: "jobs",
            label: `Jobs (${jobsQuery.data?.Jobs?.totalDocs ?? 0})`,
            children: (
                <ProfileListingList
                    deleteMutation={deleteJobMutation}
                    label="Job"
                    emptyText="No jobs created yet"
                    items={jobs}
                    loading={jobsQuery.isLoading}
                    refetch={jobsQuery.refetch}
                    urlPrefix="/jobs"
                    renderMeta={(job) => ({
                        title: job.title,
                        description: formatEmploymentType(job.employmentType),
                    })}
                />
            ),
        },
        {
            key: "companies",
            label: `Companies (${companiesQuery.data?.Companies?.totalDocs ?? 0})`,
            children: (
                <ProfileListingList
                    deleteMutation={deleteCompanyMutation}
                    label="Company"
                    emptyText="No companies created yet"
                    items={companies}
                    loading={companiesQuery.isLoading}
                    refetch={companiesQuery.refetch}
                    urlPrefix="/companies"
                    renderMeta={(company) => ({
                        title: company.name,
                    })}
                />
            ),
        },
        {
            key: "startups",
            label: `Ventures (${startupsQuery.data?.Startups?.totalDocs ?? 0})`,
            children: (
                <ProfileListingList
                    deleteMutation={deleteStartupMutation}
                    label="Venture"
                    emptyText="No ventures created yet"
                    items={startups}
                    loading={startupsQuery.isLoading}
                    refetch={startupsQuery.refetch}
                    urlPrefix="/ventures"
                    renderMeta={(startup) => ({
                        title: startup.title,
                    })}
                />
            ),
        },
        {
            key: "products",
            label: `Products (${productsQuery.data?.Products?.totalDocs ?? 0})`,
            children: (
                <ProfileListingList
                    deleteMutation={deleteProductMutation}
                    label="Product / service"
                    emptyText="No products or services created yet"
                    items={products}
                    loading={productsQuery.isLoading}
                    refetch={productsQuery.refetch}
                    urlPrefix="/products-services"
                    renderMeta={(product) => ({
                        title: product.name,
                    })}
                />
            ),
        },
    ];

    return (
        <div className="Profile">
            <Typography.Title level={2}>My Profile</Typography.Title>

            <Card className="Profile__info">
                <Space size={16} align="start">
                    <Link to="/profile">
                        <Avatar size={64} src={profile?.picture} icon={<UserOutlined />} />
                    </Link>
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Name">{profile?.name || "—"}</Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <Space>
                                {profile?.email || "—"}
                                {emailVerified
                                    ? <Tag color="success">Verified</Tag>
                                    : <Tag color="warning">Unverified</Tag>}
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                </Space>
            </Card>

            <Divider />

            <div className="Profile__forms">
                <Card title="Change Nickname" size="small" className="Profile__card">
                    <Form form={nicknameForm} layout="inline" onFinish={handleNickname}>
                        <Form.Item name="name" rules={[{ required: true, message: "Enter a nickname" }]}>
                            <Input prefix={<UserOutlined />} placeholder="New nickname" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={nicknameMutation.isPending}>
                                Update
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card title="Change Password" size="small" className="Profile__card">
                    <Form form={passwordForm} layout="vertical" onFinish={handlePassword}>
                        <Form.Item name="currentPassword" rules={[{ required: true, message: "Enter current password" }]}>
                            <Input.Password placeholder="Current password" />
                        </Form.Item>
                        <Form.Item name="newPassword" rules={[{ required: true, min: 6, message: "Min 6 characters" }]}>
                            <Input.Password placeholder="New password" />
                        </Form.Item>
                        <Form.Item name="confirm" rules={[{ required: true, message: "Confirm password" }]}>
                            <Input.Password placeholder="Confirm new password" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={passwordMutation.isPending}>
                                Change Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>

            <Divider />

            <div className="Profile__actions">
                <LoginButton action="logout" danger onAfterAction={() => navigate("/")} />
            </div>

            <Divider />

            <div className="Profile__listingsHeader">
                <Typography.Title level={3} className="Profile__listingsTitle">My Listings</Typography.Title>
                <RouteButton to="/publish" type="primary" icon={<PlusOutlined />}>Create Listing</RouteButton>
            </div>
            <Tabs items={listingTabs} />
        </div>
    );
};
