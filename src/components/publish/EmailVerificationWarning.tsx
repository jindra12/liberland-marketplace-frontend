import React from "react";
import { Button, Result, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import useCountdown from "@bradgarropy/use-countdown";
import { sendVerificationEmail } from "../../authApi";

interface Props {
    email: string;
}

export const EmailVerificationWarning: React.FunctionComponent<Props> = ({ email }) => {
    const [sending, setSending] = React.useState(false);
    const countdown = useCountdown({ minutes: 1, seconds: 0, autoStart: false });

    const handleResend = async () => {
        setSending(true);
        try {
            await sendVerificationEmail(email);
            message.success("Verification email sent");
            countdown.reset();
            countdown.start();
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
                        disabled={countdown.isRunning}
                        onClick={handleResend}
                    >
                        {countdown.isRunning ? `Resend in ${countdown.formatted}` : "Resend verification email"}
                    </Button>
                }
            />
        </div>
    );
};
