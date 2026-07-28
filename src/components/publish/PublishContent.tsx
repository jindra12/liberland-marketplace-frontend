import * as React from "react";

import { useAuth } from "react-oidc-context";

import { AuthGuard } from "../AuthGuard";
import { useListCompaniesByCreatorQuery } from "../hooks";
import { Loader } from "../Loader";

import { EmailVerificationWarning } from "./EmailVerificationWarning";
import { PublishForms } from "./PublishForms";

export interface PublishContentProps {
    url: string;
}

export const PublishContent: React.FunctionComponent<PublishContentProps> = (props) => {
    const auth = useAuth();
    const userId = auth.user?.profile?.sub;
    const emailVerified = auth.user?.profile?.email_verified;
    const ownedCompaniesQuery = useListCompaniesByCreatorQuery(
        {
            userId,
            draft: true,
            url: props.url,
        },
        {
            enabled: Boolean(userId),
            refetchOnMount: "always",
        },
    );

    return (
        <AuthGuard redirect>
            {!emailVerified ? (
                <EmailVerificationWarning email={auth.user?.profile?.email as string} url={props.url} />
            ) : (
                <Loader query={ownedCompaniesQuery}>
                    {(companies) => {
                        const docs = companies.Companies?.docs ?? [];
                        const hasCompanies = docs.length > 0;
                        const defaultCategory = hasCompanies && docs.every(({ isPrivate }) => isPrivate) ? "publish-post" : undefined;

                        return <PublishForms defaultCategory={defaultCategory} url={props.url} />;
                    }}
                </Loader>
            )}
        </AuthGuard>
    );
};
