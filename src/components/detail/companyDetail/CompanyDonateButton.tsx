import * as React from "react";

import { HeartOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { buildDonationLink } from "../../publish/CompanyPayments/utils";

interface CompanyDonateButtonProps {
    companyId: string;
    serverUrl: string;
    canAcceptThirdwebDonations?: boolean | null;
}

export const CompanyDonateButton: React.FunctionComponent<CompanyDonateButtonProps> = (props) => {
    if (!props.canAcceptThirdwebDonations) {
        return null;
    }

    return (
        <Button type="primary" icon={<HeartOutlined />} href={buildDonationLink(props.serverUrl, props.companyId)}>
            Donate
        </Button>
    );
};
