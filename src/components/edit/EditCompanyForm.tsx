import * as React from "react";

import type { CompanyByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { CompanyForm } from "../publish/CompanyForm";
import { useCompanyPaymentSettings } from "../publish/CompanyPayments/useCompanyPaymentSettings";

interface EditCompanyFormProps {
    company: Pick<
        NonNullable<CompanyByIdQuery["Company"]>,
        | "id"
        | "name"
        | "description"
        | "email"
        | "phone"
        | "website"
        | "identity"
        | "cryptoAddresses"
        | "image"
        | "acceptThirdwebDonations"
    >;
    serverUrl: string;
}

export const EditCompanyForm: React.FunctionComponent<EditCompanyFormProps> = (props) => {
    const query = useCompanyPaymentSettings(props.company.id!, props.serverUrl);
    return (
        <Loader query={query}>
            {(data) => (
                <CompanyForm
                    mode="edit"
                    url={props.serverUrl}
                    initialValues={{
                        id: props.company.id,
                        name: props.company.name,
                        description: props.company.description,
                        email: props.company.email,
                        phone: props.company.phone,
                        website: props.company.website,
                        identity: props.company.identity?.id,
                        paymentWebhookUrl: data.companyPaymentSettings?.paymentWebhookUrl,
                        acceptThirdwebDonations: props.company.acceptThirdwebDonations,
                        hasPaymentWebhookSecret: data.companyPaymentSettings?.hasWebhookSecret || false,
                        cryptoAddresses: props.company.cryptoAddresses
                            ? {
                                  chain: props.company.cryptoAddresses.chain,
                                  address: props.company.cryptoAddresses.address,
                              }
                            : undefined,
                        existingImageUrl: props.company.image?.url,
                        existingImageId: props.company.image?.id,
                    }}
                />
            )}
        </Loader>
    );
};
