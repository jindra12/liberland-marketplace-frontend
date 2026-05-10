import type { ButtonProps } from "antd";
import type { FormInstance } from "antd";

export type ReportActionProps = {
    contentLink: string;
    serverURL?: string | null;
    className?: string;
    size?: ButtonProps["size"];
};

export type ReportFormValues = {
    reason: string;
};

export type ReportActionState = {
    disabled: boolean;
    reportServerURL?: string;
    isOpen: boolean;
    isSubmitting: boolean;
    openReport: () => Promise<void>;
    closeReport: () => void;
    submitReport: (values: ReportFormValues) => Promise<void>;
    form: FormInstance<ReportFormValues>;
};
