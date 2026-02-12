import React from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useLoginUserMutation } from "../generated/graphql";

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
        <div style={{ maxWidth: 400, margin: "64px auto", padding: "0 16px" }}>
            <Card>
                <Title level={3} style={{ textAlign: "center" }}>Log In</Title>
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
                </Form>
            </Card>
        </div>
    );
};

export default Login;
