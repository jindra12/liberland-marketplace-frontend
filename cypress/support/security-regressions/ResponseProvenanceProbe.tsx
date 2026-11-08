import React from "react";
import { Button, Typography } from "antd";
import { useCommentByIdQuery, useUpdateCommentContentMutation } from "../../../src/components/hooks";
import type { UpdateCommentContentMutation } from "../../../src/generated/graphql";

interface ResponseProvenanceProbeProps {
    serverUrl: string;
    onSaved: (data: UpdateCommentContentMutation) => void;
}

export const ResponseProvenanceProbe: React.FunctionComponent<ResponseProvenanceProbeProps> = (props) => {
    const query = useCommentByIdQuery({ id: "shared-comment", url: props.serverUrl });
    const mutation = useUpdateCommentContentMutation({ onSuccess: props.onSaved });
    return (
        <>
            <Typography.Paragraph data-cy="detail-provenance">{JSON.stringify(query.data)}</Typography.Paragraph>
            <Typography.Paragraph data-cy="mutation-provenance">{JSON.stringify(mutation.data)}</Typography.Paragraph>
            <Button
                onClick={() =>
                    mutation.mutate({
                        id: "shared-comment",
                        company: "company",
                        content: "Edited",
                        url: props.serverUrl,
                    })
                }
            >
                Save source-bound comment
            </Button>
        </>
    );
};
