import * as React from "react";

import { Flex, Spin, Typography } from "antd";

import type { SplashCardProps } from "./types";

export const SplashCard = <TItem extends { id: string }>(props: SplashCardProps<TItem>) => {
    return (
        <div className={`SplashEntityCard ${props.className}`}>
            <Spin spinning={Boolean(props.loading)} className="SplashEntityCard__spin">
                {props.items.length === 0 ? (
                    <Typography.Text className="SplashEntityCard__empty">
                        {props.emptyText ?? "Coming soon!"}
                    </Typography.Text>
                ) : (
                    <Flex gap="16px" wrap={false} className="SplashEntityCard__strip">
                        {props.items.map((item) => (
                            <div key={item.id} className="SplashEntityCard__stripItem">
                                {props.renderItem(item)}
                            </div>
                        ))}
                    </Flex>
                )}
            </Spin>
        </div>
    );
};
