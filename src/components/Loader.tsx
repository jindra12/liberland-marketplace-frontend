import * as React from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Button, Result, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { convertStatusCode, getErrorMessage } from "../utils";
import { AxiosError } from "axios";

export interface LoaderProps<TData> {
    query: UseQueryResult<TData, unknown>;
    children: (data: TData, refresh: React.ReactNode) => React.ReactNode;
}

export const Loader = <TData,>(props: LoaderProps<TData>) => {
    const {
        error,
        refetch,
        data,
        isLoading,
    } = props.query;

    if (isLoading) {
        return <Spin />;
    }

    if (error) {
        const { status } = error as AxiosError;
        return (
            <Result
                status={convertStatusCode(status)}
                title={getErrorMessage(status)}
                subTitle={<Button type="primary" onClick={() => refetch()}>Retry</Button>}
            />
        );
    }

    if (data) {
        return props.children(
            data,
            <Button
                onClick={() => refetch()}
                icon={<ReloadOutlined />}
            >
                Refresh
            </Button>
        );
    }

    return null;
};