import React from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { BACKEND_URL } from "../gqlFetcher";

interface GoogleLoginResponse {
    token: string;
    exp?: number | null;
    user: { id: string; email: string; name?: string | null };
}

const getGoogleClientId = () => process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const GoogleLoginButton: React.FC = () => {
    const buttonRef = React.useRef<HTMLDivElement>(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const clientId = getGoogleClientId();

    React.useEffect(() => {
        if (!clientId) return;

        const handleCredentialResponse = async (response: { credential: string }) => {
            try {
                const res = await axios.post<GoogleLoginResponse>(
                    `${BACKEND_URL}/api/google-login`,
                    { idToken: response.credential },
                );
                const { token, exp, user } = res.data;
                if (token && user) {
                    login(token, user, exp);
                    navigate("/");
                } else {
                    message.error("Google login failed — unexpected response");
                }
            } catch (err: any) {
                message.error(err?.response?.data?.message ?? err?.message ?? "Google login failed");
            }
        };

        const initGoogle = () => {
            const google = (window as any).google;
            if (!google?.accounts?.id) return;

            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
            });

            if (buttonRef.current) {
                google.accounts.id.renderButton(buttonRef.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    width: "100%",
                    text: "signin_with",
                });
            }
        };

        if ((window as any).google?.accounts?.id) {
            initGoogle();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.head.appendChild(script);

        return () => {
            // Clean up only if we added the script
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [clientId, login, navigate]);

    if (!clientId) return null;

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <div ref={buttonRef} />
        </div>
    );
};
