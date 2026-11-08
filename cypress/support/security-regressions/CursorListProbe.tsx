import React from "react";
import { Typography } from "antd";
import { useListCompaniesQuery } from "../../../src/components/hooks";

interface CursorListProbeProps {
    page: number;
}

export const CursorListProbe: React.FunctionComponent<CursorListProbeProps> = (props) => {
    const query = useListCompaniesQuery({ page: props.page, limit: 1 });
    return (
        <Typography.Text data-cy="cursor-results">
            {query.data?.Companies?.docs.map((company) => company.name).join(", ")}
        </Typography.Text>
    );
};
