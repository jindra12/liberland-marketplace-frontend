import React from "react";
import {
    Avatar, Button, Card, Descriptions, Divider, Form, Input, List, message, Space, Tabs, Tag, Typography,
} from "antd";
import {
    EditOutlined, EyeOutlined, LogoutOutlined, MailOutlined, PlusOutlined, UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { changePassword, updateUserName } from "../authApi";
import {
    useListJobsByCreatorQuery,
    useListCompaniesByCreatorQuery,
    useListProductsByCreatorQuery,
} from "../generated/graphql";
import { formatEmploymentType } from "../utils";

export const ProfileContent: React.FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const profile = auth.user?.profile;
    const userId = profile?.sub;
    const emailVerified = profile?.email_verified;

    const [nicknameForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [nicknameLoading, setNicknameLoading] = React.useState(false);
    const [passwordLoading, setPasswordLoading] = React.useState(false);

    const jobsQuery = useListJobsByCreatorQuery(
        { userId },
        { enabled: !!userId, refetchOnMount: "always" },
    );
    const companiesQuery = useListCompaniesByCreatorQuery(
        { userId },
        { enabled: !!userId, refetchOnMount: "always" },
    );

    const companyIds = (companiesQuery.data?.Companies?.docs ?? []).map((c) => c.id);
    const productsQuery = useListProductsByCreatorQuery(
        { companyIds },
        { enabled: companyIds.length > 0, refetchOnMount: "always" },
    );

    const handleNickname = async (values: { name: string }) => {
        setNicknameLoading(true);
        try {
            await updateUserName(values.name);
            await auth.signinSilent();
            message.success("Nickname updated");
            nicknameForm.resetFields();
        } catch {
            message.error("Failed to update nickname");
        } finally {
            setNicknameLoading(false);
        }
    };

    const handlePassword = async (values: { currentPassword: string; newPassword: string; confirm: string }) => {
        if (values.newPassword !== values.confirm) {
            message.error("Passwords do not match");
            return;
        }
        setPasswordLoading(true);
        try {
            await changePassword(values.currentPassword, values.newPassword);
            message.success("Password changed");
            passwordForm.resetFields();
        } catch {
            message.error("Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.removeUser();
        navigate("/");
    };

    const jobs = jobsQuery.data?.Jobs?.docs ?? [];
    const companies = companiesQuery.data?.Companies?.docs ?? [];
    const products = productsQuery.data?.Products?.docs ?? [];

    return (
        <div className="Profile">
            <Typography.Title level={2}>My Profile</Typography.Title>

            <Card className="Profile__info">
                <Space size={16} align="start">
                    <Avatar size={64} src={profile?.picture} icon={<UserOutlined />} />
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
                            <Button type="primary" htmlType="submit" loading={nicknameLoading}>
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
                            <Button type="primary" htmlType="submit" loading={passwordLoading}>
                                Change Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>

            <Divider />

            <div className="Profile__actions">
                <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    Log out
                </Button>
            </div>

            <Divider />

            <div className="Profile__listingsHeader">
                <Typography.Title level={3} className="Profile__listingsTitle">My Listings</Typography.Title>
                <Link to="/publish">
                    <Button type="primary" icon={<PlusOutlined />}>Create Listing</Button>
                </Link>
            </div>
            <Tabs
                items={[
                    {
                        key: "jobs",
                        label: `Jobs (${jobsQuery.data?.Jobs?.totalDocs ?? 0})`,
                        children: (
                            <List
                                loading={jobsQuery.isLoading}
                                dataSource={jobs}
                                locale={{ emptyText: "No jobs created yet" }}
                                renderItem={(job) => (
                                    <List.Item
                                        actions={[
                                            <Link key="edit" to={`/jobs/${job.id}/edit`}>
                                                <Button size="small" icon={<EditOutlined />}>Edit</Button>
                                            </Link>,
                                            <Link key="view" to={`/jobs/${job.id}`}>
                                                <Button size="small" type="link" icon={<EyeOutlined />}>View</Button>
                                            </Link>,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={<Space>{job.title}{job._status === "draft" && <Tag color="orange">Draft</Tag>}</Space>}
                                            description={formatEmploymentType(job.employmentType)}
                                        />
                                    </List.Item>
                                )}
                            />
                        ),
                    },
                    {
                        key: "companies",
                        label: `Companies (${companiesQuery.data?.Companies?.totalDocs ?? 0})`,
                        children: (
                            <List
                                loading={companiesQuery.isLoading}
                                dataSource={companies}
                                locale={{ emptyText: "No companies created yet" }}
                                renderItem={(company) => (
                                    <List.Item
                                        actions={[
                                            <Link key="edit" to={`/companies/${company.id}/edit`}>
                                                <Button size="small" icon={<EditOutlined />}>Edit</Button>
                                            </Link>,
                                            <Link key="view" to={`/companies/${company.id}`}>
                                                <Button size="small" type="link" icon={<EyeOutlined />}>View</Button>
                                            </Link>,
                                        ]}
                                    >
                                        <List.Item.Meta title={<Space>{company.name}{company._status === "draft" && <Tag color="orange">Draft</Tag>}</Space>} />
                                    </List.Item>
                                )}
                            />
                        ),
                    },
                    {
                        key: "products",
                        label: `Products (${productsQuery.data?.Products?.totalDocs ?? 0})`,
                        children: (
                            <List
                                loading={productsQuery.isLoading}
                                dataSource={products}
                                locale={{ emptyText: "No products created yet" }}
                                renderItem={(product) => (
                                    <List.Item
                                        actions={[
                                            <Link key="edit" to={`/products-services/${product.id}/edit`}>
                                                <Button size="small" icon={<EditOutlined />}>Edit</Button>
                                            </Link>,
                                            <Link key="view" to={`/products-services/${product.id}`}>
                                                <Button size="small" type="link" icon={<EyeOutlined />}>View</Button>
                                            </Link>,
                                        ]}
                                    >
                                        <List.Item.Meta title={<Space>{product.name}{product._status === "draft" && <Tag color="orange">Draft</Tag>}</Space>} />
                                    </List.Item>
                                )}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
};
