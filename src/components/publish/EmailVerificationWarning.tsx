import React from "react";
import { Button, Result, Space, message } from "antd";
import { CheckCircleOutlined, MailOutlined } from "@ant-design/icons";
import useCountdown from "@bradgarropy/use-countdown";
import { useAuth } from "react-oidc-context";
import { useSendVerificationEmailMutation } from "../../authApi";
interface EmailVerificationWarningProps {
    email: string;
    url: string;
}
export const EmailVerificationWarning: React.FunctionComponent<EmailVerificationWarningProps> = (props) => {
    const auth = useAuth();
    const sendMutation = useSendVerificationEmailMutation();
    const countdown = useCountdown({
        minutes: 1,
        seconds: 0,
        autoStart: false,
    });
    const [checking, setChecking] = React.useState(false);
    const handleResend = async () => {
        try {
            await sendMutation.mutateAsync({
                email: props.email,
                url: props.url,
            });
            message.success("Verification email sent");
            countdown.reset();
            countdown.start();
        } catch {
            message.error("Failed to send verification email");
        }
    };
    const handleCheckVerification = async () => {
        setChecking(true);
        try {
            await auth.signinSilent();
        } catch {
            message.error("Could not check verification status");
        } finally {
            setChecking(false);
        }
    };
    return (
        <div className="Publish">
            <Result
                status="warning"
                title="Email not verified"
                subTitle="You need to verify your email address before you can publish listings."
                extra={
                    <Space>
                        <Button type="primary" icon={<MailOutlined />} loading={sendMutation.isPending} disabled={countdown.isRunning} onClick={handleResend}>
                            {countdown.isRunning ? `Resend in ${countdown.formatted}` : "Resend verification email"}
                        </Button>
                        <Button icon={<CheckCircleOutlined />} loading={checking} onClick={handleCheckVerification}>
                            I've verified my email
                        </Button>
                    </Space>
                }
            />
        </div>
    );
};
