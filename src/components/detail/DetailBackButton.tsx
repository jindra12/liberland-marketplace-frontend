import * as React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { RouteButton } from "../RouteButton";

type DetailBackButtonProps = {
    to: string;
    label: string;
};

export const DetailBackButton: React.FunctionComponent<DetailBackButtonProps> = ({
    to,
    label,
}) => (
    <RouteButton
        to={to}
        type="link"
        icon={<ArrowLeftOutlined />}
        className="EntityDetail__backLink EntityDetail__backButton"
    >
        {label}
    </RouteButton>
);
