import * as React from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Button, Flex, Result, Skeleton } from "antd";
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
        return (
            <Flex vertical gap={24}>
                <Flex gap={16} align="center">
                    <Skeleton.Avatar active size={80} shape="square" />
                    <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 1, width: ["40%"] }} />
                </Flex>
                <Skeleton active paragraph={{ rows: 4 }} />
            </Flex>
        );
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