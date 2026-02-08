import * as React from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Button, Result, Spin } from "antd";
import { AxiosError } from "axios";
import { ReloadOutlined } from "@ant-design/icons";

import { convertStatusCode, getErrorMessage } from "../utils";

export interface LoaderProps<TData> {
    query: UseQueryResult<TData, AxiosError>;
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
        return (
            <Result
                status={convertStatusCode(error.status)}
                title={getErrorMessage(error.status)}
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