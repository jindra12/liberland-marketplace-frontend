import * as React from "react";

import { message } from "antd";

import { LoginSuccessMessageWatcher } from "./LoginSuccessMessageWatcher";

export const LoginSuccessMessageService: React.FunctionComponent = () => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <>
            {contextHolder}
            <LoginSuccessMessageWatcher messageApi={messageApi} />
        </>
    );
};
