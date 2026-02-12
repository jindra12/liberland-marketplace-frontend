import React from "react";
import { Button, Card, Divider, Form, Input, message, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useLoginUserMutation } from "../generated/graphql";
import { SocialLoginButtons } from "./SocialLoginButtons";

const { Title } = Typography;

interface LoginFormValues {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const mutation = useLoginUserMutation();

    React.useEffect(() => {
        if (user) navigate("/", { replace: true });
    }, [user, navigate]);

    const onFinish = (values: LoginFormValues) => {
        mutation.mutate(values, {
            onSuccess: (data) => {
                const result = data.loginUser;
                if (result?.token && result.user) {
                    login(result.token, result.user, result.exp);
                    navigate("/");
                } else {
                    message.error("Login failed — unexpected response");
                }
            },
            onError: (err: any) => {
                message.error(err?.message ?? "Login failed");
            },
        });
    };

    if (user) return null;

    return (
        <div style={{ maxWidth: 680, margin: "64px auto", padding: "0 16px" }}>
            <Card>
                <Title level={3} style={{ textAlign: "center" }}>Log In</Title>
                <SocialLoginButtons />
                <Divider plain>or</Divider>
                <Form<LoginFormValues> layout="vertical" onFinish={onFinish}>
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
                        rules={[{ required: true, message: "Please enter your password" }]}
                    >
                        <Input.Password autoComplete="current-password" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={mutation.isPending}
                        >
                            Log In
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: "center" }}>
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
