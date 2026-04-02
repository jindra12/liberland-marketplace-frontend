import * as React from "react";

import { ConfigProvider, theme } from "antd";

import { darkToken, darkComponents } from "../darkToken";

export const AntProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: darkToken,
                components: darkComponents,
            }}
        >
            {props.children}
        </ConfigProvider>
    );
};
