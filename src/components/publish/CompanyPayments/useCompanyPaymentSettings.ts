import { useAuth } from "react-oidc-context";
import { useQuery } from "@tanstack/react-query";

import {
    CompanyPaymentSettingsDocument,
    type CompanyPaymentSettingsQuery,
    type CompanyPaymentSettingsQueryVariables,
    useCompanyPaymentSettingsQuery,
} from "../../../generated/graphql";
import { gqlFetcher } from "../../../gqlFetcher";
import { buildAuthAuthority, readStoredAuthUser } from "../../auth/utils";

export const useCompanyPaymentSettings = (companyId: string, serverUrl: string) => {
    const auth = useAuth();
    return useQuery({
        queryKey: [
            ...useCompanyPaymentSettingsQuery.getKey({ companyId }),
            serverUrl,
            (auth.settings.authority === buildAuthAuthority(serverUrl)
                ? auth.user
                : readStoredAuthUser(serverUrl))?.profile.sub,
        ],
        queryFn: gqlFetcher<CompanyPaymentSettingsQuery, CompanyPaymentSettingsQueryVariables>(
            CompanyPaymentSettingsDocument,
            { companyId },
            undefined,
            serverUrl,
        ),
        // Discard owner-only integration settings when the form unmounts.
        gcTime: 0,
        retry: false,
    });
};
