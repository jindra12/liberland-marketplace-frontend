import React from "react";
import { Button } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import { useAuth } from "./AuthContext";

const Login: React.FunctionComponent = () => {
    const { login, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return (
            <div style={{ padding: 48, textAlign: "center" }}>
                <p>You are already logged in.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: 48, textAlign: "center" }}>
            <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={login}
            >
                Log in
            </Button>
        </div>
    );
};

export default Login;
