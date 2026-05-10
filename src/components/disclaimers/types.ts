export type DisclaimerKey = "privacy" | "terms" | "reportContent" | "serverPolicy" | "dataRequests";

export type DisclaimerDefinition = {
    key: DisclaimerKey;
    title: string;
    markdown: string;
};

export type DisclaimersContextValue = {
    isOpen: boolean;
    selectedDisclaimerKey: DisclaimerKey;
    openDisclaimers: (key?: DisclaimerKey) => void;
    closeDisclaimers: () => void;
    selectDisclaimer: (key: DisclaimerKey) => void;
};
