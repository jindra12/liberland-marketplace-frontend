import React from "react";
import { Input, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../../../src/components/Loader";

interface LoaderDraftProbeProps {
    fetch: () => Promise<{ name: string }>;
}

export const LoaderDraftProbe: React.FunctionComponent<LoaderDraftProbeProps> = (props) => {
    const query = useQuery({ queryKey: ["loader-draft-fixture"], queryFn: props.fetch, retry: false });
    return (
        <Loader query={query}>
            {(data, refresh) => (
                <Space>
                    <Input aria-label="Draft name" defaultValue={data.name} />
                    {refresh}
                </Space>
            )}
        </Loader>
    );
};
