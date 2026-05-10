import * as React from "react";

import { InfoCircleOutlined } from "@ant-design/icons";
import { Popover, Tag, Typography } from "antd";

import type { Company_Verification } from "../../../generated/graphql";

import { getCompanyVerificationDetails } from "./utils";

type CompanyVerificationTagProps = {
    verification?: Company_Verification | null;
};

export const CompanyVerificationTag: React.FunctionComponent<CompanyVerificationTagProps> = (props) => {
    const details = getCompanyVerificationDetails(props.verification);

    if (!details) {
        return null;
    }

    return (
        <Popover
            trigger={["hover", "click"]}
            title="Seller status"
            content={<Typography.Text>{details.description}</Typography.Text>}
            classNames={{ root: "CompanyVerificationTag__popover" }}
        >
            <Tag color={details.color} icon={<InfoCircleOutlined />} className="CompanyVerificationTag">
                {details.label}
            </Tag>
        </Popover>
    );
};
