import React from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Alert } from "antd";
import { exchangeCode, decodeIdToken, fetchUserInfo } from "../oidc";
import { useAuth } from "./AuthContext";

const AuthCallback: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const { setSession } = useAuth();
    const [error, setError] = React.useState<string | null>(null);
    const handled = React.useRef(false);

    React.useEffect(() => {
        if (handled.current) return;
        handled.current = true;

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const savedState = sessionStorage.getItem("oidc_state");
        const codeVerifier = sessionStorage.getItem("oidc_code_verifier");

        if (!code || !state || !savedState || !codeVerifier) {
            setError("Missing authorization parameters.");
            return;
        }

        if (state !== savedState) {
            setError("Invalid state parameter — possible CSRF attack.");
            return;
        }

        sessionStorage.removeItem("oidc_state");
        sessionStorage.removeItem("oidc_code_verifier");

        (async () => {
            try {
                const tokenResponse = await exchangeCode(code, codeVerifier);

                // Prefer decoding the id_token (no extra request);
                // fall back to userinfo endpoint if no id_token
                const user = tokenResponse.id_token
                    ? decodeIdToken(tokenResponse.id_token)
                    : await fetchUserInfo(tokenResponse.access_token);

                setSession(tokenResponse.access_token, user);
                navigate("/", { replace: true });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Authentication failed.");
            }
        })();
    }, [navigate, setSession]);

    if (error) {
        return (
            <div style={{ padding: 48, textAlign: "center" }}>
                <Alert type="error" message="Login failed" description={error} showIcon />
            </div>
        );
    }

    return (
        <div style={{ padding: 48, textAlign: "center" }}>
            <Spin size="large" tip="Completing login..." />
        </div>
    );
};

export default AuthCallback;
