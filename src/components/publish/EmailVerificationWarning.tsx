import React from "react";
import { Button, Result, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { sendVerificationEmail } from "../../authApi";

interface Props {
    email: string;
}

export const EmailVerificationWarning: React.FunctionComponent<Props> = ({ email }) => {
    const [cooldown, setCooldown] = React.useState(0);
    const [sending, setSending] = React.useState(false);

    React.useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async () => {
        setSending(true);
        try {
            await sendVerificationEmail(email);
            message.success("Verification email sent");
            setCooldown(60);
        } catch {
            message.error("Failed to send verification email");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="Publish">
            <Result
                status="warning"
                title="Email not verified"
                subTitle="You need to verify your email address before you can publish listings."
                extra={
                    <Button
                        type="primary"
                        icon={<MailOutlined />}
                        loading={sending}
                        disabled={cooldown > 0}
                        onClick={handleResend}
                    >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
                    </Button>
                }
            />
        </div>
    );
};
