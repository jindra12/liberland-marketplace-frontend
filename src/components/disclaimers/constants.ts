import dataRequestsMarkdown from "../../../disclaimers/DATA_REQUESTS.md";
import privacyMarkdown from "../../../disclaimers/PRIVACY.md";
import reportContentMarkdown from "../../../disclaimers/REPORT_CONTENT.md";
import serverPolicyMarkdown from "../../../disclaimers/SERVER_POLICY.md";
import termsMarkdown from "../../../disclaimers/TERMS_OF_USE.md";

import type { DisclaimerDefinition } from "./types";

export const defaultDisclaimerKey = "privacy" as const;

export const disclaimerDefinitions: DisclaimerDefinition[] = [
    {
        key: "privacy",
        title: "Privacy",
        markdown: privacyMarkdown,
    },
    {
        key: "terms",
        title: "Terms of Use",
        markdown: termsMarkdown,
    },
    {
        key: "reportContent",
        title: "Report Content",
        markdown: reportContentMarkdown,
    },
    {
        key: "serverPolicy",
        title: "Server Policy",
        markdown: serverPolicyMarkdown,
    },
    {
        key: "dataRequests",
        title: "Data Requests",
        markdown: dataRequestsMarkdown,
    },
];

export const disclaimerMenuItems = disclaimerDefinitions.map((definition) => ({
    key: definition.key,
    label: definition.title,
}));
