import React from "react";
import { Typography } from "antd";
import { useAccumulatedDocs } from "../../../src/hooks/useAccumulatedDocs";

interface AccumulatedDocsProbeProps {
    docs: Array<{ id: string; name: string }>;
    page: number;
}

export const AccumulatedDocsProbe: React.FunctionComponent<AccumulatedDocsProbeProps> = (props) => {
    const docs = useAccumulatedDocs(props.docs, props.page);
    return <Typography.Text data-cy="accumulated-documents">{docs.map((doc) => doc.name).join(", ")}</Typography.Text>;
};
