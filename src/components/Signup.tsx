import React from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useCreateUserMutation, useLoginUserMutation } from "../generated/graphql";

const { Title } = Typography;

interface SignupFormValues {
    name: string;
    email: string;
    password: string;
    confirm: string;
}

const Signup: React.FC = () => {
    const { user } = useAuth();
    const { login } = useAuth();
    const navigate = useNavigate();
    const createMutation = useCreateUserMutation();
    const loginMutation = useLoginUserMutation();

    React.useEffect(() => {
        if (user) navigate("/", { replace: true });
    }, [user, navigate]);

    const onFinish = (values: SignupFormValues) => {
        createMutation.mutate(
            { data: { email: values.email, password: values.password, name: values.name } },
            {
                onSuccess: () => {
                    loginMutation.mutate(
                        { email: values.email, password: values.password },
                        {
                            onSuccess: (data) => {
                                const result = data.loginUser;
                                if (result?.token && result.user) {
                                    login(result.token, result.user, result.exp);
                                    message.success("Account created");
                                    navigate("/");
                                } else {
                                    message.success("Account created — please log in");
                                    navigate("/login");
                                }
                            },
                            onError: () => {
                                message.success("Account created — please log in");
                                navigate("/login");
                            },
                        },
                    );
                },
                onError: (err: any) => {
                    message.error(err?.message ?? "Signup failed");
                },
            },
        );
    };

    if (user) return null;

    const isPending = createMutation.isPending || loginMutation.isPending;

    return (
        <div style={{ maxWidth: 400, margin: "64px auto", padding: "0 16px" }}>
            <Card>
                <Title level={3} style={{ textAlign: "center" }}>Sign Up</Title>
                <Form<SignupFormValues> layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter your name" }]}
                    >
                        <Input autoComplete="name" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Please enter your email" },
                            { type: "email", message: "Please enter a valid email" },
                        ]}
                    >
                        <Input autoComplete="email" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: "Please enter a password" },
                            { min: 6, message: "Password must be at least 6 characters" },
                        ]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirm"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Please confirm your password" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={isPending}>
                            Sign Up
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: "center" }}>
                        Already have an account? <Link to="/login">Log in</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Signup;
