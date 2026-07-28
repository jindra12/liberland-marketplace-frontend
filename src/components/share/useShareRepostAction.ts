import * as React from "react";

import { Form, message } from "antd";
import type { FormInstance } from "antd";

import { useShareRepostMutation } from "../hooks";
import { getReportServerURL } from "../report/utils";

export type ShareRepostActionProps = {
    contentLink: string;
    serverURL?: string | null;
    className?: string;
};

export type ShareRepostFormValues = {
    description?: string;
    companyId: string;
};

export type ShareRepostActionState = {
    disabled: boolean;
    isOpen: boolean;
    isSubmitting: boolean;
    openRepost: () => Promise<void>;
    closeRepost: () => void;
    submitRepost: (values: ShareRepostFormValues) => Promise<void>;
    form: FormInstance<ShareRepostFormValues>;
};

export const useShareRepostAction = (props: ShareRepostActionProps): ShareRepostActionState => {
    const [form] = Form.useForm<ShareRepostFormValues>();
    const [isOpen, setIsOpen] = React.useState(false);
    const shareRepostMutation = useShareRepostMutation();
    const repostServerURL = React.useMemo(
        () => props.serverURL ?? getReportServerURL(props.contentLink),
        [props.contentLink, props.serverURL],
    );

    const openRepost = async () => {
        form.resetFields();
        setIsOpen(true);
    };

    const closeRepost = () => {
        setIsOpen(false);
        form.resetFields();
    };

    const submitRepost = async (values: ShareRepostFormValues) => {
        if (!repostServerURL) {
            message.error("Could not determine which server should receive this repost.");
            return;
        }

        try {
            await shareRepostMutation.mutateAsync({
                url: repostServerURL,
                input: {
                    companyId: values.companyId,
                    description: values.description ? values.description : null,
                    link: props.contentLink,
                },
            });
            message.success("Repost shared");
            closeRepost();
        } catch (error) {
            console.error("Failed to submit repost", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Could not share repost";
            message.error(errorMessage);
        }
    };

    return {
        disabled: !repostServerURL,
        isOpen,
        isSubmitting: shareRepostMutation.isPending,
        openRepost,
        closeRepost,
        submitRepost,
        form,
    };
};
