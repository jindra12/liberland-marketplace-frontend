import * as React from "react";

import { useAuth } from "react-oidc-context";

import { Form, message } from "antd";

import { useCreateReportMutation, useMeUserQuery } from "../hooks";

import type { ReportActionProps, ReportActionState, ReportFormValues } from "./types";
import { getReportServerURL, isReportedContent } from "./utils";

export const useReportAction = (props: ReportActionProps): ReportActionState => {
    const auth = useAuth();
    const [form] = Form.useForm<ReportFormValues>();
    const [isOpen, setIsOpen] = React.useState(false);
    const reportServerURL = React.useMemo(
        () => props.serverURL ?? getReportServerURL(props.contentLink),
        [props.contentLink, props.serverURL],
    );
    const meUserQuery = useMeUserQuery({ url: reportServerURL }, { enabled: auth.isAuthenticated && Boolean(reportServerURL) });
    const createReportMutation = useCreateReportMutation();
    const reportedLinks = meUserQuery.data?.[0]?.meUser?.user?.reportedLinks;

    const disabled = !reportServerURL || isReportedContent(reportedLinks, props.contentLink);

    const openReport = async () => {
        form.resetFields();
        setIsOpen(true);
    };

    const closeReport = () => {
        setIsOpen(false);
        form.resetFields();
    };

    const submitReport = async (values: ReportFormValues) => {
        if (!reportServerURL) {
            message.error("Could not determine which server should receive this report.");
            return;
        }

        const userId = auth.user?.profile?.sub;

        if (!userId) {
            message.error("Unable to identify your account for this report.");
            return;
        }

        try {
            await createReportMutation.mutateAsync({
                url: reportServerURL,
                data: {
                    contentLink: props.contentLink,
                    reason: values.reason,
                    userId,
                    createdBy: userId,
                },
            });
            await meUserQuery.refetch();
            message.success("Report submitted");
            closeReport();
        } catch (error) {
            console.error("Failed to submit report", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Could not submit report";
            message.error(errorMessage);
        }
    };

    return {
        disabled,
        reportServerURL,
        isOpen,
        isSubmitting: createReportMutation.isPending,
        openReport,
        closeReport,
        submitReport,
        form,
    };
};
