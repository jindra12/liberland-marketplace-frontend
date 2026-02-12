import React from "react";
import { Button, Space, Typography } from "antd";
import { GoogleLoginButton } from "./GoogleLoginButton";

const { Text } = Typography;

const mockProviders = [
    { name: "Liberland", logo: "/liberland_logo.jpg" },
    { name: "Prospera", logo: "/prospera_logo.jpg" },
    { name: "Praxis", logo: "/praxis_logo.svg" },
    { name: "NS", logo: "/networkschool_logo.jpeg" },
    { name: "Arc", logo: undefined },
    { name: "Sealand", logo: "/sealand_logo.png" },
];

export const SocialLoginButtons: React.FC = () => {
    return (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
            <GoogleLoginButton />
            <div style={{ position: "relative" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, justifyItems: "center" }}>
                    {mockProviders.map(({ name, logo }) => (
                        <Button
                            key={name}
                            block
                            disabled
                            icon={logo ? <img src={logo} alt={name} style={{ width: 18, height: 18, objectFit: "contain", borderRadius: 2 }} /> : undefined}
                        >
                            Log in with {name}
                        </Button>
                    ))}
                </div>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(2px)",
                        borderRadius: 8,
                        zIndex: 1,
                    }}
                >
                    <Text strong style={{ fontSize: 16, opacity: 0.7 }}>Coming Soon</Text>
                </div>
            </div>
        </Space>
    );
};
