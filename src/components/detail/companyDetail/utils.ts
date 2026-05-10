import { Company_Verification } from "../../../generated/graphql";

export type CompanyVerificationDetails = {
    label: "trader" | "private seller";
    description: string;
    color: "blue" | "gold";
};

export const getCompanyVerificationDetails = (
    verification?: Company_Verification | null,
): CompanyVerificationDetails | undefined => {
    switch (verification) {
        case Company_Verification.Trader:
            return {
                label: "trader",
                description:
                    "This company says it acts in a business capacity, so consumer rules may apply.",
                color: "blue",
            };
        case Company_Verification.PrivateSeller:
            return {
                label: "private seller",
                description:
                    "This company says it is selling as a private person, so consumer rules may be more limited.",
                color: "gold",
            };
        case Company_Verification.Unverified:
        default:
            return undefined;
    }
};
